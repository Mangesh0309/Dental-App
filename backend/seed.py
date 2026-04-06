from datetime import date, time, timedelta

from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import Clinic, Doctor, DoctorSchedule, RoleEnum, User

app = create_app()


def seed():
    with app.app_context():
        db.create_all()

        if not User.query.filter_by(email="admin@demo.com").first():
            db.session.add(
                User(
                    name="Clinic Admin",
                    email="admin@demo.com",
                    phone="9999999992",
                    password=generate_password_hash("Password123"),
                    role=RoleEnum.ADMIN,
                )
            )

        if not User.query.filter_by(email="patient@demo.com").first():
            db.session.add(
                User(
                    name="Aarav Sharma",
                    email="patient@demo.com",
                    phone="9999999991",
                    password=generate_password_hash("Password123"),
                    role=RoleEnum.PATIENT,
                )
            )

        clinics = [
            {"name": "Smile Studio Indiranagar", "city": "Bengaluru", "address": "100 Feet Road, Indiranagar"},
            {"name": "Smile Studio Banjara Hills", "city": "Hyderabad", "address": "Road No. 12, Banjara Hills"},
        ]
        for item in clinics:
            if not Clinic.query.filter_by(name=item["name"]).first():
                db.session.add(Clinic(**item))

        if not Doctor.query.filter_by(name="Dr. Meera Iyer").first():
            db.session.add(
                Doctor(
                    name="Dr. Meera Iyer",
                    specialization="Dental Surgeon",
                    bio="Specialist in preventive, restorative, and cosmetic dental care.",
                )
            )

        db.session.commit()

        doctor = Doctor.query.filter_by(name="Dr. Meera Iyer").first()
        for offset, clinic in enumerate(Clinic.query.order_by(Clinic.id.asc()).all()):
            schedule_date = date.today() + timedelta(days=offset + 1)
            exists = DoctorSchedule.query.filter_by(
                doctor_id=doctor.id,
                clinic_id=clinic.id,
                date=schedule_date,
            ).first()
            if not exists:
                db.session.add(
                    DoctorSchedule(
                        doctor_id=doctor.id,
                        clinic_id=clinic.id,
                        date=schedule_date,
                        start_time=time(hour=10),
                        end_time=time(hour=17),
                        slot_duration=30,
                    )
                )

        db.session.commit()
        print("Seed data created.")


if __name__ == "__main__":
    seed()
