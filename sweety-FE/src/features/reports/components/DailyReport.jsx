import { motion } from 'framer-motion';
import { SLOT_META } from '../../../constants/slots.js';
import { glucoseTone } from '../../../utils/date.js';
import { EmptyState } from './EmptyState.jsx';

export function DailyReport({ report }) {
  const readings = Array.isArray(report?.readings) ? report.readings : [];

  if (!report || report.stats?.count === 0 || readings.length === 0) {
    return (
      <EmptyState
        title="No readings on this day"
        body="Add a few glucose values on the Readings page to see today’s highest, lowest and average."
      />
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white/90 p-3.5 shadow-sm ring-1 ring-stone-200/80">
      <div className="flex items-center justify-between border-b border-stone-200/70 pb-2.5 shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
            Daily Log
          </span>
          <h2 className="text-sm font-bold text-stone-900">
            {report.range?.label || 'Today’s readings'}
          </h2>
        </div>
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
          {readings.length}/4 slots logged
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 py-2 flex-1 overflow-y-auto">
        {readings.map((reading, index) => {
          const meta = SLOT_META.find((item) => item.slot === reading.slot);
          const Icon = meta?.icon;
          const tone = glucoseTone(reading.value);
          return (
            <motion.div
              key={reading.id || `${reading.date}-${reading.slot}-${index}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center justify-between rounded-xl bg-stone-50/70 px-3.5 py-2.5 ring-1 ring-stone-200/70 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                {Icon ? (
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-stone-700 shadow-2xs ring-1 ring-stone-200/60">
                    <Icon className="h-4 w-4" />
                  </span>
                ) : null}
                <div>
                  <span className="font-semibold text-stone-900 text-xs">{reading.slot}</span>
                  <p className="text-[10px] text-stone-400">Logged on {reading.date}</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold rounded-lg px-2.5 py-1 shadow-2xs ${
                  tone === 'high'
                    ? 'text-rose-700 bg-rose-50 ring-1 ring-rose-200/60'
                    : tone === 'low'
                      ? 'text-sky-700 bg-sky-50 ring-1 ring-sky-200/60'
                      : 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200/60'
                }`}
              >
                {reading.value} mg/dl
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
