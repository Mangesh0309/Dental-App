from datetime import datetime, timedelta

from ..models import Appointment, AppointmentStatus, DoctorSchedule


class SchedulingError(ValueError):
    pass


def ensure_no_overlap(doctor_id, schedule_date, start_time, end_time, exclude_id=None):
    query = DoctorSchedule.query.filter(
        DoctorSchedule.doctor_id == doctor_id,
        DoctorSchedule.date == schedule_date,
        DoctorSchedule.is_active.is_(True),
        DoctorSchedule.start_time < end_time,
        DoctorSchedule.end_time > start_time,
    )
    if exclude_id:
        query = query.filter(DoctorSchedule.id != exclude_id)
    if query.first():
        raise SchedulingError("Doctor already has an overlapping schedule on this date.")


def generate_slots(schedule):
    slots = []
    current = datetime.combine(schedule.date, schedule.start_time)
    end_dt = datetime.combine(schedule.date, schedule.end_time)
    slot_length = timedelta(minutes=schedule.slot_duration)
    while current + slot_length <= end_dt:
        slots.append(current.time().strftime("%H:%M"))
        current += slot_length
    return slots


def get_booked_slot_strings(doctor_id, clinic_id, schedule_date):
    appointments = Appointment.query.filter(
        Appointment.doctor_id == doctor_id,
        Appointment.clinic_id == clinic_id,
        Appointment.date == schedule_date,
        Appointment.status.in_(
            [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]
        ),
    ).all()
    return {appointment.time.strftime("%H:%M") for appointment in appointments}


def get_available_slots(doctor_id, clinic_id, schedule_date):
    schedules = (
        DoctorSchedule.query.filter_by(
            doctor_id=doctor_id, clinic_id=clinic_id, date=schedule_date, is_active=True
        )
        .order_by(DoctorSchedule.start_time.asc())
        .all()
    )
    booked = get_booked_slot_strings(doctor_id, clinic_id, schedule_date)
    available = []
    for schedule in schedules:
        for slot in generate_slots(schedule):
            available.append(
                {
                    "schedule_id": schedule.id,
                    "time": slot,
                    "is_available": slot not in booked,
                }
            )
    return available


def assert_slot_available(doctor_id, clinic_id, schedule_date, slot_time):
    slot_value = slot_time.strftime("%H:%M")
    available = get_available_slots(doctor_id, clinic_id, schedule_date)
    if not any(slot["time"] == slot_value and slot["is_available"] for slot in available):
        raise SchedulingError("Selected time slot is no longer available.")


def get_schedule_by_slot(doctor_id, clinic_id, schedule_date, slot_time):
    matching_schedules = DoctorSchedule.query.filter_by(
        doctor_id=doctor_id, clinic_id=clinic_id, date=schedule_date, is_active=True
    ).all()
    for schedule in matching_schedules:
        if slot_time.strftime("%H:%M") in generate_slots(schedule):
            return schedule
    raise SchedulingError("No schedule found for the selected slot.")
