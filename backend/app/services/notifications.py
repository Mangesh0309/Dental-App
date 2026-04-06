import smtplib
from email.mime.text import MIMEText

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client as TwilioClient

from ..config import Config


def send_email(subject, recipient, body):
    if Config.SENDGRID_API_KEY:
        message = Mail(
            from_email=Config.EMAIL_FROM,
            to_emails=recipient,
            subject=subject,
            html_content=body,
        )
        SendGridAPIClient(Config.SENDGRID_API_KEY).send(message)
        return True
    if Config.SMTP_HOST and Config.SMTP_USERNAME and Config.SMTP_PASSWORD:
        mime = MIMEText(body, "html")
        mime["Subject"] = subject
        mime["From"] = Config.EMAIL_FROM
        mime["To"] = recipient
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
            server.starttls()
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
            server.sendmail(Config.EMAIL_FROM, [recipient], mime.as_string())
        return True
    return False


def send_sms(recipient, body):
    if not (Config.TWILIO_ACCOUNT_SID and Config.TWILIO_AUTH_TOKEN and Config.TWILIO_PHONE_NUMBER):
        return False
    client = TwilioClient(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
    client.messages.create(body=body, from_=Config.TWILIO_PHONE_NUMBER, to=recipient)
    return True
