import { motion } from 'framer-motion';

export function StatsCard({
  label,
  value,
  unit,
  icon: Icon,
  className = '',
  featured = false,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex h-full flex-col rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/80 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        {Icon ? (
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-stone-100 text-stone-700">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p
        className={`mt-4 font-display tracking-tight text-stone-900 ${
          featured ? 'text-5xl sm:text-6xl' : 'text-4xl'
        }`}
      >
        {value ?? '—'}
      </p>
      {unit ? <p className="mt-auto pt-2 text-sm text-stone-500">{unit}</p> : null}
    </motion.article>
  );
}
