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
            ? "border-teal-200 bg-white dark:bg-slate-700 dark:border-slate-600 text-teal-700 dark:text-teal-400"
            : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
      }`}
    >
      {slot.time}
    </button>
  );
}
