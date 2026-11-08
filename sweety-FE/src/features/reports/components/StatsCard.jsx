export function StatsCard({ label, value, unit, icon: Icon, className = '' }) {
  return (
    <article
      className={`flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 shadow-xs ring-1 ring-stone-200/80 ${className}`}
    >
      <div>
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-display text-2xl font-bold tracking-tight text-stone-900">
            {value ?? '—'}
          </span>
          {unit ? <span className="text-xs font-medium text-stone-400">{unit}</span> : null}
        </div>
      </div>
      {Icon ? (
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-stone-100/80 text-stone-700 shadow-2xs">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
    </article>
  );
}
