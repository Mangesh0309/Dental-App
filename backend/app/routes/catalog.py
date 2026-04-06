from datetime import datetime

from flask import Blueprint, jsonify, request

from ..models import Clinic, Doctor
from ..services.scheduling import get_available_slots

catalog_bp = Blueprint("catalog", __name__, url_prefix="/api")


@catalog_bp.get("/cities")
def get_cities():
    cities = sorted({clinic.city for clinic in Clinic.query.all()})
    return jsonify({"cities": cities})


@catalog_bp.get("/clinics")
def get_clinics():
    city = request.args.get("city")
    query = Clinic.query
    if city:
        query = query.filter_by(city=city)
    clinics = query.order_by(Clinic.name.asc()).all()
    return jsonify({"clinics": [clinic.to_dict() for clinic in clinics]})


@catalog_bp.get("/doctors")
def get_doctors():
    doctors = Doctor.query.order_by(Doctor.name.asc()).all()
    return jsonify({"doctors": [doctor.to_dict() for doctor in doctors]})


@catalog_bp.get("/availability")
def get_availability():
    doctor_id = request.args.get("doctor_id", type=int)
    clinic_id = request.args.get("clinic_id", type=int)
    date_str = request.args.get("date")
    if not all([doctor_id, clinic_id, date_str]):
        return jsonify({"message": "doctor_id, clinic_id and date are required."}), 400

    schedule_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    slots = get_available_slots(doctor_id, clinic_id, schedule_date)
    return jsonify({"slots": slots})
