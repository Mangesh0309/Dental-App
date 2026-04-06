export default function SlotChip({ slot, selected, onClick }) {
  return (
    <button
      type="button"
      disabled={!slot.is_available}
      onClick={() => onClick(slot)}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        selected
          ? "border-teal-600 bg-teal-600 text-white"
          : slot.is_available
            ? "border-teal-200 bg-white text-teal-700"
            : "border-slate-200 bg-slate-100 text-slate-400"
      }`}
    >
      {slot.time}
    </button>
  );
}
