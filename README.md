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

## Step 1: Create the MySQL Database

Open MySQL and create a database:

```sql
CREATE DATABASE dental_clinic;
```

If you want to use a different database name, update `DATABASE_URL` inside `backend/.env`.

## Step 2: Configure the Backend Environment

Go to the backend folder and create or update your `.env` file.

Path:

`backend/.env`

Minimum required values:

```env
FLASK_ENV=development
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/dental_clinic
FRONTEND_URL=http://localhost:5173
SLOT_DURATION_MINUTES=30
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SENDGRID_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_FROM=no-reply@clinic.local
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GOOGLE_CALENDAR_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=
```

Notes:

- For local testing, you can leave Razorpay, Twilio, SendGrid, and Google Calendar values empty.
- The app will still run.
- Payment confirmation works in local demo mode when gateway keys are not configured.

## Step 3: Install Backend Dependencies

From the project root:

```bash
cd backend
pip install -r requirements.txt
```

If you use a virtual environment, create and activate it before installing:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Step 4: Create the Database Tables

From the `backend` folder, run:

```bash
flask --app run db init
flask --app run db migrate -m "Initial schema"
flask --app run db upgrade
```

Important:

- Run `db init` only once for a new project.
- If the `migrations/` folder already exists later, you only need `db migrate` and `db upgrade`.

If you want a quick local setup and do not want to manage migrations right away, you can also use the seed script after dependencies are installed. It calls `db.create_all()` internally.

## Step 5: Seed Demo Data

This creates:

- One admin user
- One patient user
- Demo clinics in different cities
- One doctor
- Demo schedules for the next few days

Run:

```bash
python seed.py
```

Demo accounts created by the seed:

- Admin
  - Email: `admin@demo.com`
  - Password: `Password123`
- Patient
  - Email: `patient@demo.com`
  - Password: `Password123`

## Step 6: Start the Backend

From the `backend` folder:

```bash
python run.py
```

The backend runs at:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

## Step 7: Configure the Frontend Environment

Path:

`frontend/.env`

Use:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 8: Install Frontend Dependencies

From the project root:

```bash
cd frontend
npm install
```

## Step 9: Start the Frontend

From the `frontend` folder:

```bash
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## Step 10: Open the App

1. Start the backend
2. Start the frontend
3. Open `http://localhost:5173`
4. Sign in with the demo patient or demo admin account

## Full Local Run Order

If you want the shortest working path, use this order:

1. Create MySQL database `dental_clinic`
2. Update `backend/.env`
3. Run `cd backend`
4. Run `pip install -r requirements.txt`
5. Run `python seed.py`
6. Run `python run.py`
7. Open a new terminal
8. Run `cd frontend`
9. Run `npm install`
10. Run `npm run dev`
11. Open `http://localhost:5173`

## How To Test the App

There are two main roles you should test first:

1. Admin
2. Customer / Patient

### Test as Admin

Sign in using:

- Email: `admin@demo.com`
- Password: `Password123`

What to test:

1. Login
   - Confirm admin login works
   - Confirm the Admin tab is visible

2. Dashboard
   - Open the Admin page
   - Check that daily appointment and revenue cards load

3. Add a clinic
   - Create a new clinic with a city and address
   - Example:
     - Name: `City Dental Center`
     - City: `Chennai`
     - Address: `Anna Nagar, Chennai`

4. Add a doctor
   - Create a doctor profile
   - Example:
     - Name: `Dr. Rahul Menon`
     - Specialization: `Orthodontist`

5. Create a schedule
   - Select a doctor
   - Select a clinic
   - Choose a date
   - Set start and end times
   - Save the schedule

6. Test overlap prevention
   - Create one schedule for a doctor from `10:00` to `14:00`
   - Try creating another schedule for the same doctor on the same date from `12:00` to `16:00`
   - Expected result: it should reject the second schedule

7. Export report
   - Use the report endpoint later through browser or API client:
   - `GET /api/admin/reports/appointments.csv`

What success looks like:

- Clinics save correctly
- Doctors save correctly
- Schedules save correctly
- Overlapping schedules are blocked
- Dashboard metrics load without errors

### Test as Customer / Patient

Sign in using:

- Email: `patient@demo.com`
- Password: `Password123`

What to test:

1. Login
   - Confirm patient login works

2. Select city
   - Choose a city from the dropdown
   - Confirm clinics load for that city

3. Select clinic and doctor
   - Choose a clinic
   - Choose a doctor
   - Pick a date that has a seeded schedule

4. View slots
   - Confirm available slots load
   - Confirm the slot grid appears

5. Book appointment
   - Pick an available slot
   - Click `Pay and confirm booking`
   - Expected result: appointment should be created and confirmed

6. Check appointment history
   - Open the History tab
   - Confirm the newly booked appointment appears

7. Reschedule appointment
   - Click `Reschedule`
   - Expected result: appointment date/time changes if the target slot is available

8. Cancel appointment
   - Click `Cancel`
   - Expected result: appointment status becomes cancelled

What success looks like:

- Slots load correctly
- Booking succeeds
- The same slot cannot be double-booked
- History updates after booking, rescheduling, or cancellation

## Suggested End-to-End Test Flow

Use this exact flow for a quick confidence check:

1. Run `python seed.py`
2. Login as admin
3. Add one new clinic
4. Add one new doctor
5. Create one schedule for tomorrow
6. Logout
7. Login as patient
8. Choose that clinic and doctor
9. Book a slot
10. Open History
11. Reschedule the booking
12. Cancel the booking

If all of that works, your local build is in a good state.

## How Payments Work in Local Testing

Right now the project supports two modes:

1. Demo mode
2. Real Razorpay mode

### Demo mode

If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are empty:

- The backend creates a fake order
- The frontend completes a mock confirmation step
- This is enough for end-to-end local booking tests

### Real Razorpay mode

If you configure real Razorpay credentials:

- Backend creates a real payment order
- You should replace the mock frontend confirmation with Razorpay Checkout
- Backend signature verification is already structured for that flow

## How Reminders Work

The project includes a reminder endpoint:

`POST /api/internal/run-reminders`

This is intended to be triggered by:

- A cron job
- A scheduled Render job
- A background worker

It checks:

- Email reminders for appointments 24 hours away
- SMS reminders for appointments about 2 hours away

For local testing, if email/SMS providers are not configured, the endpoint will still run but messages will not actually send.

## How To Deploy

Recommended deployment:

1. Frontend on Vercel
2. Backend on Render
3. MySQL on a managed MySQL provider such as Railway MySQL, PlanetScale, Amazon RDS, or another MySQL host

## Deployment Option A: Simple and Practical

### Backend on Render

1. Push this repo to GitHub
2. Create a new Web Service on Render
3. Set the root directory to:

`backend`

4. Build command:

```bash
pip install -r requirements.txt
```

5. Start command:

```bash
python run.py
```

6. Add environment variables from `backend/.env`
7. Set `DATABASE_URL` to your production MySQL connection string
8. Set `FRONTEND_URL` to your Vercel frontend URL after frontend deployment

Important production note:

- Render expects your service to bind to the `PORT` environment variable
- For production, update `backend/run.py` to use:

```python
import os
from app import create_app

app = create_app(os.getenv("FLASK_ENV", "default"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
```

### Frontend on Vercel

1. Import the GitHub repo into Vercel
2. Set the root directory to:

`frontend`

3. Build command:

```bash
npm install && npm run build
```

4. Output directory:

`dist`

5. Add environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

6. Deploy

## Deployment Option B: AWS

If you want more control:

- Frontend: Vercel or S3 + CloudFront
- Backend: AWS Elastic Beanstalk, ECS, or EC2
- Database: Amazon RDS MySQL
- Background reminders: EventBridge + Lambda or cron on EC2/ECS

This is better if you want:

- Stronger scaling
- Private networking
- Easier future expansion

## Production Checklist

Before going live, do these:

1. Change `SECRET_KEY`
2. Change `JWT_SECRET_KEY`
3. Use a production MySQL database
4. Replace demo payment flow with real Razorpay checkout
5. Configure email and SMS providers
6. Configure Google Calendar credentials if needed
7. Add HTTPS-only production URLs
8. Add logging and error monitoring
9. Run migrations in production
10. Restrict internal reminder endpoints

## Current Limitations

A few things are scaffolded but still need production refinement:

- Frontend payment flow is mock/demo for local testing
- Reminder execution is manual and should be scheduled
- OTP login is not implemented yet
- Role permissions are basic and not clinic-scoped
- Automated tests are not added yet

## Main Files You Will Use Most

- Backend entry: `backend/run.py`
- Backend seed data: `backend/seed.py`
- Backend routes: `backend/app/routes/`
- Scheduling logic: `backend/app/services/scheduling.py`
- Frontend app shell: `frontend/src/App.jsx`
- Booking page: `frontend/src/pages/BookingPage.jsx`
- Admin page: `frontend/src/pages/AdminPage.jsx`

## Quick Troubleshooting

### Backend does not start

Check:

- MySQL is running
- `DATABASE_URL` is correct
- Python dependencies are installed

### Frontend does not connect to backend

Check:

- Backend is running on `http://localhost:5000`
- `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`
- `FRONTEND_URL` in backend matches `http://localhost:5173`

### No slots appear

Check:

- You ran `python seed.py`
- You selected a city, clinic, doctor, and date
- The selected date has schedules

### Booking fails

Check:

- That slot is still available
- Backend is running
- Seed data exists

## Next Recommended Improvement

The first change I recommend before deployment is:

1. Update `backend/run.py` to use `PORT`
2. Add real `.env.example` files for backend and frontend
3. Replace the mock payment confirmation with Razorpay Checkout
4. Add automated API tests for booking and scheduling
