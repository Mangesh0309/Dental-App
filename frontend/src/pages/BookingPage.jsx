import { useEffect, useState } from "react";
import api from "../lib/api";
import SectionCard from "../components/SectionCard";
import SlotChip from "../components/SlotChip";
import { getFestivalWish } from "../lib/festivals";

const initialForm = {
  city: "",
  clinic_id: "",
  doctor_id: "",
  date: new Date().toISOString().slice(0, 10)
};

export default function BookingPage({ user }) {
  const [cities, setCities] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    Promise.all([api.get("/cities"), api.get("/doctors")]).then(([cityRes, doctorRes]) => {
      setCities(cityRes.data.cities);
      setDoctors(doctorRes.data.doctors);
    });
  }, []);

  useEffect(() => {
    if (!form.city) return;
    api.get(`/clinics?city=${form.city}`).then((response) => setClinics(response.data.clinics));
  }, [form.city]);

  useEffect(() => {
    if (!form.clinic_id || !form.doctor_id || !form.date) return;
    api
      .get("/availability", {
        params: {
          clinic_id: form.clinic_id,
          doctor_id: form.doctor_id,
          date: form.date
        }
      })
      .then((response) => setSlots(response.data.slots));
  }, [form.clinic_id, form.doctor_id, form.date]);

  const onBook = async () => {
    if (!selectedSlot) {
      setFeedback("Select a time slot to continue.");
      return;
    }
    try {
      const response = await api.post("/appointments", {
        clinic_id: Number(form.clinic_id),
        doctor_id: Number(form.doctor_id),
        date: form.date,
        time: selectedSlot.time,
        amount: 50000
      });
      const appointmentId = response.data.appointment.id;
      await api.post(`/appointments/${appointmentId}/confirm-payment`, {
        order_id: response.data.payment_order.order_id,
        payment_id: `demo_${appointmentId}`,
        signature: `verified_${appointmentId}`
      });
      setFeedback("Appointment booked and confirmed.");
      setSelectedSlot(null);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Could not complete the booking.");
    }
  };

  return (
    <div className="space-y-5 pb-28">
      <section className="rounded-[32px] bg-slate-900 dark:bg-slate-800 p-6 text-white shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-teal-300 dark:text-teal-400">Welcome</p>
        <h1 className="mt-3 font-heading text-3xl font-bold leading-tight">
          {getFestivalWish()}
        </h1>
        <p className="mt-3 text-sm text-slate-300 dark:text-slate-400">
          Book dental care across cities without calling the clinic. Live slot availability, instant payment, and automated reminders.
        </p>
        {user ? (
          <div className="mt-5 rounded-2xl bg-white/10 dark:bg-white/5 px-4 py-3 text-sm text-slate-100">
            Signed in as {user.name}
          </div>
        ) : null}
      </section>

      <SectionCard title="Find a clinic" subtitle="Choose city, clinic, doctor, and date">
        <div className="grid gap-3">
          <select
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value, clinic_id: "" }))}
          >
            <option value="">Select city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            value={form.clinic_id}
            onChange={(event) => setForm((current) => ({ ...current, clinic_id: event.target.value }))}
          >
            <option value="">Select clinic</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            value={form.doctor_id}
            onChange={(event) => setForm((current) => ({ ...current, doctor_id: event.target.value }))}
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-4 py-3"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          />
        </div>
      </SectionCard>

      <SectionCard title="Available slots" subtitle="Booked slots are blocked in real time">
        <div className="grid grid-cols-3 gap-3">
          {slots.length ? (
            slots.map((slot) => (
              <SlotChip
                key={`${slot.schedule_id}-${slot.time}`}
                slot={slot}
                selected={selectedSlot?.time === slot.time}
                onClick={setSelectedSlot}
              />
            ))
          ) : (
            <p className="col-span-3 text-sm text-slate-500">Choose a clinic, doctor, and date to load slots.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onBook}
          className="mt-5 w-full rounded-2xl bg-teal-600 px-5 py-4 font-semibold text-white transition hover:bg-teal-700"
        >
          Pay and confirm booking
        </button>
        {feedback ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{feedback}</p> : null}
      </SectionCard>
    </div>
  );
}
