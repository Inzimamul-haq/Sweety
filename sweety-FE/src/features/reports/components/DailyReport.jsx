import { motion } from 'framer-motion';
import { SLOT_META } from '../../../constants/slots.js';
import { glucoseTone } from '../../../utils/date.js';
import { EmptyState } from './EmptyState.jsx';

export function DailyReport({ report }) {
  if (!report || report.stats.count === 0) {
    return (
      <EmptyState
        title="No readings on this day"
        body="Add a few glucose values on the Readings page to see today’s highest, lowest and average."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {report.readings.map((reading, index) => {
        const meta = SLOT_META.find((item) => item.slot === reading.slot);
        const Icon = meta?.icon;
        const tone = glucoseTone(reading.value);
        return (
          <motion.div
            key={reading.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex items-center justify-between rounded-3xl bg-white/80 px-4 py-4 ring-1 ring-stone-200/80"
          >
            <div className="flex items-center gap-3">
              {Icon ? (
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-100 text-stone-700">
                  <Icon className="h-4 w-4" />
                </span>
              ) : null}
              <span className="font-medium text-stone-800">{reading.slot}</span>
            </div>
            <span
              className={`text-sm font-semibold ${
                tone === 'high'
                  ? 'text-rose-700'
                  : tone === 'low'
                    ? 'text-sky-700'
                    : 'text-emerald-700'
              }`}
            >
              {reading.value} mg/dl
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
