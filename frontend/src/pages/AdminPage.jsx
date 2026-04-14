import { useEffect, useState } from "react";
import api from "../lib/api";
import SectionCard from "../components/SectionCard";
import { getFestivalWish } from "../lib/festivals";

const clinicForm = { name: "", city: "", address: "" };
const adminForm = { name: "", email: "", phone: "", password: "" };
const doctorForm = { name: "", specialization: "", bio: "" };
const scheduleForm = {
  doctor_id: "",
  clinic_id: "",
  date: new Date().toISOString().slice(0, 10),
  start_time: "10:00",
  end_time: "18:00",
  slot_duration: 30
};

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [clinicValues, setClinicValues] = useState(clinicForm);
  const [adminValues, setAdminValues] = useState(adminForm);
  const [doctorValues, setDoctorValues] = useState(doctorForm);
  const [scheduleValues, setScheduleValues] = useState(scheduleForm);
  const [message, setMessage] = useState("");

  const loadData = () => {
    Promise.all([api.get("/admin/dashboard"), api.get("/doctors"), api.get("/clinics")])
      .then(([dashboardRes, doctorsRes, clinicsRes]) => {
        setDashboard(dashboardRes.data);
        setDoctors(doctorsRes.data.doctors);
        setClinics(clinicsRes.data.clinics);
      })
      .catch((error) => setMessage(error.response?.data?.message || "Admin access is required."));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (path, payload, reset) => {
    try {
      await api.post(path, payload);
      setMessage("Saved successfully.");
      reset();
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Save failed.");
    }
  };

  return (
    <div className="space-y-5 pb-28">
      <section className="rounded-[32px] bg-slate-900 dark:bg-slate-800 p-6 text-white shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-teal-300 dark:text-teal-400">Welcome Admin</p>
        <h1 className="mt-3 font-heading text-3xl font-bold leading-tight">
          {getFestivalWish()}
        </h1>
        <p className="mt-3 text-sm text-slate-300 dark:text-slate-400">
          Manage clinics, doctors, schedules, and monitor daily metrics.
        </p>
      </section>

      <SectionCard title="Admin dashboard" subtitle="Daily appointments, revenue, and ops controls">
        {dashboard ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-slate-900 dark:bg-slate-700 p-4 text-white">
              <p className="text-sm text-slate-300 dark:text-slate-400">Appointments today</p>
              <p className="mt-2 text-3xl font-bold">{dashboard.metrics.appointments}</p>
            </div>
            <div className="rounded-3xl bg-teal-600 dark:bg-teal-700 p-4 text-white">
              <p className="text-sm text-teal-50 dark:text-teal-100">Revenue today</p>
              <p className="mt-2 text-3xl font-bold">Rs {dashboard.metrics.revenue / 100}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Sign in as admin or doctor to view dashboard data.</p>
        )}
      </SectionCard>

      <SectionCard title="Create Admin" subtitle="Add a new admin user">
        <div className="grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Full name"
            value={adminValues.name}
            onChange={(event) => setAdminValues((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Email"
            value={adminValues.email}
            onChange={(event) => setAdminValues((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Phone"
            value={adminValues.phone}
            onChange={(event) => setAdminValues((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            type="password"
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Password"
            value={adminValues.password}
            onChange={(event) => setAdminValues((current) => ({ ...current, password: event.target.value }))}
          />
          <button
            type="button"
            className="rounded-2xl bg-slate-900 dark:bg-teal-600 px-5 py-3 font-semibold text-white"
            onClick={() => handleSubmit("/admin/admins", adminValues, () => setAdminValues(adminForm))}
          >
            Create admin
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Add clinic" subtitle="Manage branches across cities">
        <div className="grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Clinic name"
            value={clinicValues.name}
            onChange={(event) => setClinicValues((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="City"
            value={clinicValues.city}
            onChange={(event) => setClinicValues((current) => ({ ...current, city: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Address"
            value={clinicValues.address}
            onChange={(event) => setClinicValues((current) => ({ ...current, address: event.target.value }))}
          />
          <button
            type="button"
            className="rounded-2xl bg-slate-900 dark:bg-teal-600 px-5 py-3 font-semibold text-white"
            onClick={() => handleSubmit("/admin/clinics", clinicValues, () => setClinicValues(clinicForm))}
          >
            Save clinic
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Add doctor" subtitle="Create doctor profiles">
        <div className="grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Doctor name"
            value={doctorValues.name}
            onChange={(event) => setDoctorValues((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Specialization"
            value={doctorValues.specialization}
            onChange={(event) => setDoctorValues((current) => ({ ...current, specialization: event.target.value }))}
          />
          <textarea
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            placeholder="Bio"
            rows="3"
            value={doctorValues.bio}
            onChange={(event) => setDoctorValues((current) => ({ ...current, bio: event.target.value }))}
          />
          <button
            type="button"
            className="rounded-2xl bg-slate-900 dark:bg-teal-600 px-5 py-3 font-semibold text-white"
            onClick={() => handleSubmit("/admin/doctors", doctorValues, () => setDoctorValues(doctorForm))}
          >
            Save doctor
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Create schedule" subtitle="Prevent overlaps and generate dynamic slots">
        <div className="grid gap-3">
          <select
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            value={scheduleValues.doctor_id}
            onChange={(event) => setScheduleValues((current) => ({ ...current, doctor_id: event.target.value }))}
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            value={scheduleValues.clinic_id}
            onChange={(event) => setScheduleValues((current) => ({ ...current, clinic_id: event.target.value }))}
          >
            <option value="">Select clinic</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name} - {clinic.city}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            value={scheduleValues.date}
            onChange={(event) => setScheduleValues((current) => ({ ...current, date: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
              value={scheduleValues.start_time}
              onChange={(event) => setScheduleValues((current) => ({ ...current, start_time: event.target.value }))}
            />
            <input
              type="time"
              className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
              value={scheduleValues.end_time}
              onChange={(event) => setScheduleValues((current) => ({ ...current, end_time: event.target.value }))}
            />
          </div>
          <button
            type="button"
            className="rounded-2xl bg-teal-600 dark:bg-teal-700 px-5 py-3 font-semibold text-white"
            onClick={() =>
              handleSubmit(
                "/admin/schedules",
                {
                  ...scheduleValues,
                  doctor_id: Number(scheduleValues.doctor_id),
                  clinic_id: Number(scheduleValues.clinic_id),
                  slot_duration: Number(scheduleValues.slot_duration)
                },
                () => setScheduleValues(scheduleForm)
              )
            }
          >
            Save schedule
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}
      </SectionCard>
    </div>
  );
}
