from datetime import datetime, timedelta

from flask import Blueprint, jsonify

from ..extensions import db
from ..models import Appointment, AppointmentStatus, NotificationLog, ReminderChannel
from ..services.notifications import send_email, send_sms

reminders_bp = Blueprint("reminders", __name__, url_prefix="/api/internal")


@reminders_bp.post("/run-reminders")
def run_reminders():
    now = datetime.utcnow()
    email_target = (now + timedelta(hours=24)).date()
    sms_start = now + timedelta(hours=2)
    sms_end = sms_start + timedelta(minutes=30)
    appointments = Appointment.query.filter(
        Appointment.status == AppointmentStatus.CONFIRMED
    ).all()
    sent = {"email": 0, "sms": 0}

    for appointment in appointments:
        if appointment.date == email_target:
            if send_email(
                "Appointment reminder",
                appointment.user.email,
                f"Reminder: you have an appointment on {appointment.date.isoformat()} at {appointment.time.strftime('%H:%M')}.",
            ):
                db.session.add(
                    NotificationLog(
                        appointment_id=appointment.id,
                        channel=ReminderChannel.EMAIL,
                        reminder_type="24h",
                        status="sent",
                        recipient=appointment.user.email,
                    )
                )
                sent["email"] += 1

        appointment_dt = datetime.combine(appointment.date, appointment.time)
        if sms_start <= appointment_dt <= sms_end:
            if send_sms(
                appointment.user.phone,
                f"Reminder: appointment today at {appointment.time.strftime('%H:%M')} at {appointment.clinic.name}.",
            ):
                db.session.add(
                    NotificationLog(
                        appointment_id=appointment.id,
                        channel=ReminderChannel.SMS,
                        reminder_type="2h",
                        status="sent",
                        recipient=appointment.user.phone,
                    )
                )
                sent["sms"] += 1

    db.session.commit()
    return jsonify({"sent": sent})
