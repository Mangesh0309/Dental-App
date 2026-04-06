import csv
import io
from datetime import date

from sqlalchemy import func

from ..models import Appointment, Payment, PaymentStatus


def daily_metrics(report_date=None):
    report_date = report_date or date.today()
    appointments = Appointment.query.filter(Appointment.date == report_date).count()
    revenue = (
        Payment.query.join(Appointment)
        .filter(Appointment.date == report_date, Payment.status == PaymentStatus.PAID)
        .with_entities(func.coalesce(func.sum(Payment.amount), 0))
        .scalar()
    )
    return {
        "date": report_date.isoformat(),
        "appointments": appointments,
        "revenue": revenue,
    }


def appointment_csv_rows():
    rows = (
        Appointment.query.order_by(Appointment.date.desc(), Appointment.time.desc()).all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Appointment ID", "Patient", "Doctor", "Clinic", "Date", "Time", "Status"])
    for row in rows:
        writer.writerow(
            [
                row.id,
                row.user.name,
                row.doctor.name,
                row.clinic.name,
                row.date.isoformat(),
                row.time.strftime("%H:%M"),
                row.status.value,
            ]
        )
    return output.getvalue()
