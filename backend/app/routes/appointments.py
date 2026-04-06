from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from ..config import Config
from ..extensions import db
from ..models import Appointment, AppointmentStatus, Payment, PaymentStatus
from ..services.calendar import create_calendar_event
from ..services.notifications import send_email, send_sms
from ..services.payments import payment_gateway
from ..services.scheduling import SchedulingError, assert_slot_available, get_schedule_by_slot

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")


def _can_access_appointment(appointment):
    claims = get_jwt()
    if claims.get("role") in ["admin", "doctor"]:
        return True
    return appointment.user_id == int(get_jwt_identity())


def _appointment_message(appointment):
    return (
        f"Your appointment with Dr. {appointment.doctor.name} at {appointment.clinic.name} "
        f"is scheduled for {appointment.date.isoformat()} {appointment.time.strftime('%H:%M')}."
    )


@appointments_bp.post("")
@jwt_required()
def create_appointment():
    payload = request.get_json() or {}
    user_id = int(get_jwt_identity())
    doctor_id = payload.get("doctor_id")
    clinic_id = payload.get("clinic_id")
    date_str = payload.get("date")
    time_str = payload.get("time")
    amount = payload.get("amount", 50000)

    if not all([doctor_id, clinic_id, date_str, time_str]):
        return jsonify({"message": "doctor_id, clinic_id, date and time are required."}), 400

    appointment_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    appointment_time = datetime.strptime(time_str, "%H:%M").time()

    try:
        assert_slot_available(doctor_id, clinic_id, appointment_date, appointment_time)
        schedule = get_schedule_by_slot(doctor_id, clinic_id, appointment_date, appointment_time)
    except SchedulingError as exc:
        return jsonify({"message": str(exc)}), 409

    appointment = Appointment(
        user_id=user_id,
        doctor_id=doctor_id,
        clinic_id=clinic_id,
        schedule_id=schedule.id,
        date=appointment_date,
        time=appointment_time,
        status=AppointmentStatus.PENDING,
        notes=payload.get("notes"),
    )
    db.session.add(appointment)
    db.session.flush()

    order = payment_gateway.create_order(
        amount=amount,
        currency=Config.DEFAULT_CURRENCY,
        receipt=f"appt_{appointment.id}",
    )
    payment = Payment(
        appointment_id=appointment.id,
        amount=amount,
        currency=Config.DEFAULT_CURRENCY,
        status=PaymentStatus.PENDING,
        order_id=order.get("id"),
    )
    db.session.add(payment)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Selected time slot was just booked by another patient."}), 409

    return (
        jsonify(
            {
                "appointment": appointment.to_dict(),
                "payment_order": {
                    "order_id": order.get("id"),
                    "amount": amount,
                    "currency": Config.DEFAULT_CURRENCY,
                    "key": Config.RAZORPAY_KEY_ID or "local_key",
                },
            }
        ),
        201,
    )


@appointments_bp.post("/<int:appointment_id>/confirm-payment")
@jwt_required()
def confirm_payment(appointment_id):
    payload = request.get_json() or {}
    appointment = Appointment.query.get_or_404(appointment_id)
    if not _can_access_appointment(appointment):
        return jsonify({"message": "Not authorized to confirm this payment."}), 403
    payment = Payment.query.filter_by(appointment_id=appointment.id).first_or_404()
    signature_ok = payment_gateway.verify_signature(
        payload.get("order_id"),
        payload.get("payment_id"),
        payload.get("signature"),
    )
    if not signature_ok:
        payment.status = PaymentStatus.FAILED
        db.session.commit()
        return jsonify({"message": "Payment signature validation failed."}), 400

    payment.status = PaymentStatus.PAID
    payment.payment_id = payload.get("payment_id")
    payment.transaction_id = payload.get("payment_id")
    payment.gateway_signature = payload.get("signature")
    appointment.status = AppointmentStatus.CONFIRMED
    appointment.calendar_event_id = create_calendar_event(appointment)
    db.session.commit()

    send_email("Appointment confirmed", appointment.user.email, _appointment_message(appointment))
    send_sms(appointment.user.phone, _appointment_message(appointment))

    return jsonify({"appointment": appointment.to_dict(), "payment": payment.to_dict()})


@appointments_bp.get("")
@jwt_required()
def get_appointments():
    claims = get_jwt()
    query = Appointment.query.order_by(Appointment.date.desc(), Appointment.time.desc())
    if claims.get("role") == "patient":
        query = query.filter_by(user_id=int(get_jwt_identity()))
    appointments = query.all()
    return jsonify({"appointments": [appointment.to_dict() for appointment in appointments]})


@appointments_bp.patch("/<int:appointment_id>")
@jwt_required()
def update_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    if not _can_access_appointment(appointment):
        return jsonify({"message": "Not authorized to update this appointment."}), 403
    payload = request.get_json() or {}
    action = payload.get("action")
    if action == "cancel":
        appointment.status = AppointmentStatus.CANCELLED
    elif action == "reschedule":
        appointment_date = datetime.strptime(payload["date"], "%Y-%m-%d").date()
        appointment_time = datetime.strptime(payload["time"], "%H:%M").time()
        try:
            assert_slot_available(appointment.doctor_id, appointment.clinic_id, appointment_date, appointment_time)
            schedule = get_schedule_by_slot(
                appointment.doctor_id,
                appointment.clinic_id,
                appointment_date,
                appointment_time,
            )
        except SchedulingError as exc:
            return jsonify({"message": str(exc)}), 409
        appointment.date = appointment_date
        appointment.time = appointment_time
        appointment.schedule_id = schedule.id
        appointment.status = AppointmentStatus.RESCHEDULED
    else:
        return jsonify({"message": "Unsupported action."}), 400

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Selected reschedule slot is no longer available."}), 409
    return jsonify({"appointment": appointment.to_dict()})
