import json
from datetime import datetime, timedelta, timezone

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:  # pragma: no cover
    service_account = None
    build = None

from ..config import Config


def create_calendar_event(appointment):
    if not (Config.GOOGLE_SERVICE_ACCOUNT_JSON and Config.GOOGLE_CALENDAR_ID and service_account and build):
        return None

    creds_info = json.loads(Config.GOOGLE_SERVICE_ACCOUNT_JSON)
    credentials = service_account.Credentials.from_service_account_info(
        creds_info, scopes=["https://www.googleapis.com/auth/calendar"]
    )
    service = build("calendar", "v3", credentials=credentials)
    start_dt = datetime.combine(appointment.date, appointment.time).replace(
        tzinfo=timezone.utc
    )
    end_dt = start_dt + timedelta(minutes=30)
    body = {
        "summary": f"Dental appointment - {appointment.user.name}",
        "location": appointment.clinic.address,
        "description": f"Doctor: {appointment.doctor.name}",
        "start": {"dateTime": start_dt.isoformat()},
        "end": {"dateTime": end_dt.isoformat()},
        "reminders": {
            "useDefault": False,
            "overrides": [{"method": "email", "minutes": 1440}, {"method": "popup", "minutes": 120}],
        },
    }
    event = service.events().insert(calendarId=Config.GOOGLE_CALENDAR_ID, body=body).execute()
    return event.get("id")
