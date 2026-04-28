from datetime import datetime

from flask import Blueprint, Response, jsonify, request
from flask_jwt_extended import get_jwt, jwt_required

from ..extensions import db
from werkzeug.security import generate_password_hash
from ..models import Clinic, Doctor, DoctorSchedule, Payment, User, RoleEnum
from ..services.reports import appointment_csv_rows, daily_metrics
from ..services.scheduling import SchedulingError, ensure_no_overlap

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _require_staff():
    role = get_jwt().get("role")
    if role not in ["admin", "doctor"]:
        return jsonify({"message": "Staff access required."}), 403
    return None


def _require_admin():
    role = get_jwt().get("role")
    if role != "admin":
        return jsonify({"message": "Admin access required."}), 403
    return None


@admin_bp.post("/admins")
@jwt_required()
def create_admin():
    denied = _require_admin()
    if denied:
        return denied

    payload = request.get_json() or {}
    required = ["name", "email", "phone", "password"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    if User.query.filter((User.email == payload["email"]) | (User.phone == payload["phone"])).first():
        return jsonify({"message": "Email or phone already exists."}), 409

    admin_user = User(
        name=payload["name"],
        email=payload["email"],
        phone=payload["phone"],
        password=generate_password_hash(payload["password"]),
        role=RoleEnum.ADMIN,
    )
    db.session.add(admin_user)
    db.session.commit()

    return jsonify({"user": admin_user.to_dict()}), 201


@admin_bp.get("/dashboard")
@jwt_required()
def dashboard():
    denied = _require_staff()
    if denied:
        return denied
    report_date = request.args.get("date")
    metric_date = datetime.strptime(report_date, "%Y-%m-%d").date() if report_date else None
    recent_payments = Payment.query.order_by(Payment.created_at.desc()).limit(10).all()
    return jsonify(
        {
            "metrics": daily_metrics(metric_date),
            "recent_payments": [payment.to_dict() for payment in recent_payments],
        }
    )


@admin_bp.post("/clinics")
@jwt_required()
def create_clinic():
    denied = _require_staff()
    if denied:
        return denied
    payload = request.get_json() or {}
    clinic = Clinic(name=payload["name"], city=payload["city"], address=payload["address"])
    db.session.add(clinic)
    db.session.commit()
    return jsonify({"clinic": clinic.to_dict()}), 201


@admin_bp.post("/doctors")
@jwt_required()
def create_doctor():
    denied = _require_staff()
    if denied:
        return denied
    payload = request.get_json() or {}
    doctor = Doctor(
        name=payload["name"],
        specialization=payload["specialization"],
        bio=payload.get("bio"),
    )
    db.session.add(doctor)
    db.session.commit()
    return jsonify({"doctor": doctor.to_dict()}), 201


@admin_bp.post("/schedules")
@jwt_required()
def create_schedule():
    denied = _require_staff()
    if denied:
        return denied
    payload = request.get_json() or {}
    schedule_date = datetime.strptime(payload["date"], "%Y-%m-%d").date()
    start_time = datetime.strptime(payload["start_time"], "%H:%M").time()
    end_time = datetime.strptime(payload["end_time"], "%H:%M").time()
    try:
        ensure_no_overlap(payload["doctor_id"], schedule_date, start_time, end_time)
    except SchedulingError as exc:
        return jsonify({"message": str(exc)}), 409
    schedule = DoctorSchedule(
        doctor_id=payload["doctor_id"],
        clinic_id=payload["clinic_id"],
        date=schedule_date,
        start_time=start_time,
        end_time=end_time,
        slot_duration=payload.get("slot_duration", 30),
    )
    db.session.add(schedule)
    db.session.commit()
    return jsonify({"schedule": schedule.to_dict()}), 201


@admin_bp.get("/reports/appointments.csv")
@jwt_required()
def export_appointments():
    denied = _require_staff()
    if denied:
        return denied
    csv_content = appointment_csv_rows()
    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=appointments.csv"},
    )
