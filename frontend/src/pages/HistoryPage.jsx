import { useEffect, useState } from "react";
import api from "../lib/api";
import SectionCard from "../components/SectionCard";

export default function HistoryPage() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  const loadAppointments = () => {
    api.get("/appointments").then((response) => setAppointments(response.data.appointments));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateAppointment = async (appointmentId, action) => {
    const payload =
      action === "reschedule"
        ? {
            action,
            date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            time: "10:00"
          }
        : { action };
    try {
      await api.patch(`/appointments/${appointmentId}`, payload);
      setMessage(`Appointment ${action} request completed.`);
      loadAppointments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="space-y-5 pb-28">
      <SectionCard title="Appointment history" subtitle="Upcoming, completed, cancelled, and rescheduled visits">
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-3xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-4 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{appointment.clinic.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Dr. {appointment.doctor.name} on {appointment.date} at {appointment.time}
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 dark:bg-teal-900/50 px-3 py-1 text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">
                  {appointment.status}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => updateAppointment(appointment.id, "reschedule")}
                  className="rounded-2xl border border-slate-200 dark:border-slate-500 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => updateAppointment(appointment.id, "cancel")}
                  className="rounded-2xl border border-rose-200 dark:border-rose-800/50 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {!appointments.length ? <p className="text-sm text-slate-500 dark:text-slate-400">No appointments yet.</p> : null}
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}
      </SectionCard>
    </div>
  );
}
