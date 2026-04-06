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
            <div key={appointment.id} className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{appointment.clinic.name}</p>
                  <p className="text-sm text-slate-500">
                    Dr. {appointment.doctor.name} on {appointment.date} at {appointment.time}
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase text-teal-700">
                  {appointment.status}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => updateAppointment(appointment.id, "reschedule")}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => updateAppointment(appointment.id, "cancel")}
                  className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {!appointments.length ? <p className="text-sm text-slate-500">No appointments yet.</p> : null}
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      </SectionCard>
    </div>
  );
}
