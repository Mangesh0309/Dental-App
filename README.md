# Dental / Medical Clinic Booking System

This project is a full-stack appointment booking system for a small dental or medical clinic where a doctor can work across multiple clinics and cities.

It includes:

- A Flask backend API
- A React + Tailwind mobile-first frontend
- JWT authentication
- Dynamic doctor schedule and slot generation
- Appointment booking, rescheduling, and cancellation
- Admin tools for clinics, doctors, schedules, and reporting
- Payment, notification, and calendar integration hooks

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Flask, SQLAlchemy, Flask-JWT-Extended
- Database: MySQL
- Payments: Razorpay integration hook
- Notifications: SMTP / SendGrid and Twilio hooks
- Calendar: Google Calendar integration hook

## Project Structure

```text
backend/
  app/
    routes/
    services/
  run.py
  seed.py
frontend/
  src/
README.md
```

## Before You Start

Make sure these are installed on your machine:

1. Python 3.10+
2. Node.js 18+ and npm
3. MySQL Server

Recommended versions for this repo:

- Python: `3.10.x`
- Node: `22.x` is working in this workspace
- npm: `10.x`

