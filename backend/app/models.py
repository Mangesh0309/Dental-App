from datetime import datetime
from enum import Enum

from sqlalchemy import UniqueConstraint

from .extensions import db


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class RoleEnum(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    RESCHEDULED = "rescheduled"


class PaymentStatus(str, Enum):
    CREATED = "created"
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class ReminderChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(RoleEnum), default=RoleEnum.PATIENT, nullable=False)

    appointments = db.relationship("Appointment", back_populates="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role.value,
        }


class Clinic(TimestampMixin, db.Model):
    __tablename__ = "clinics"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    city = db.Column(db.String(120), nullable=False, index=True)
    address = db.Column(db.String(255), nullable=False)

    schedules = db.relationship("DoctorSchedule", back_populates="clinic", lazy=True)
    appointments = db.relationship("Appointment", back_populates="clinic", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "city": self.city,
            "address": self.address,
        }


class Doctor(TimestampMixin, db.Model):
    __tablename__ = "doctors"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    specialization = db.Column(db.String(120), nullable=False)
    bio = db.Column(db.Text, nullable=True)

    schedules = db.relationship("DoctorSchedule", back_populates="doctor", lazy=True)
    appointments = db.relationship("Appointment", back_populates="doctor", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "specialization": self.specialization,
            "bio": self.bio,
        }


class DoctorSchedule(TimestampMixin, db.Model):
    __tablename__ = "doctor_schedules"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)
    clinic_id = db.Column(db.Integer, db.ForeignKey("clinics.id"), nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    slot_duration = db.Column(db.Integer, nullable=False, default=30)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    doctor = db.relationship("Doctor", back_populates="schedules")
    clinic = db.relationship("Clinic", back_populates="schedules")

    __table_args__ = (
        UniqueConstraint(
            "doctor_id",
            "clinic_id",
            "date",
            "start_time",
            "end_time",
            name="uq_schedule_window",
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "clinic_id": self.clinic_id,
            "date": self.date.isoformat(),
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M"),
            "slot_duration": self.slot_duration,
            "is_active": self.is_active,
            "doctor": self.doctor.to_dict(),
            "clinic": self.clinic.to_dict(),
        }


class Appointment(TimestampMixin, db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)
    clinic_id = db.Column(db.Integer, db.ForeignKey("clinics.id"), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey("doctor_schedules.id"), nullable=True)
    date = db.Column(db.Date, nullable=False, index=True)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(
        db.Enum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False
    )
    notes = db.Column(db.Text, nullable=True)
    calendar_event_id = db.Column(db.String(255), nullable=True)

    user = db.relationship("User", back_populates="appointments")
    doctor = db.relationship("Doctor", back_populates="appointments")
    clinic = db.relationship("Clinic", back_populates="appointments")
    payments = db.relationship("Payment", back_populates="appointment", lazy=True)

    __table_args__ = (
        UniqueConstraint(
            "doctor_id", "clinic_id", "date", "time", name="uq_appointment_slot"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "doctor_id": self.doctor_id,
            "clinic_id": self.clinic_id,
            "date": self.date.isoformat(),
            "time": self.time.strftime("%H:%M"),
            "status": self.status.value,
            "notes": self.notes,
            "doctor": self.doctor.to_dict(),
            "clinic": self.clinic.to_dict(),
            "payment": self.payments[0].to_dict() if self.payments else None,
        }


class Payment(TimestampMixin, db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="INR")
    status = db.Column(db.Enum(PaymentStatus), nullable=False, default=PaymentStatus.CREATED)
    payment_id = db.Column(db.String(255), nullable=True)
    order_id = db.Column(db.String(255), nullable=True)
    transaction_id = db.Column(db.String(255), nullable=True)
    gateway_signature = db.Column(db.String(255), nullable=True)

    appointment = db.relationship("Appointment", back_populates="payments")

    def to_dict(self):
        return {
            "id": self.id,
            "appointment_id": self.appointment_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status.value,
            "payment_id": self.payment_id,
            "order_id": self.order_id,
            "transaction_id": self.transaction_id,
        }


class NotificationLog(TimestampMixin, db.Model):
    __tablename__ = "notification_logs"

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=False)
    channel = db.Column(db.Enum(ReminderChannel), nullable=False)
    reminder_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    recipient = db.Column(db.String(120), nullable=False)
