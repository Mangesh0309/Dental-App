export default function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="glass rounded-[28px] border border-white/70 dark:border-slate-700 p-5 shadow-card dark:bg-slate-800 transition-colors duration-300">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
