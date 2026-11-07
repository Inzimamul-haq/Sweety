import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { SLOT_META } from '../../../constants/slots.js';
import { glucoseTone } from '../../../utils/date.js';

const tones = {
  low: 'text-sky-700 bg-sky-50',
  ok: 'text-emerald-700 bg-emerald-50',
  high: 'text-rose-700 bg-rose-50',
};

export function SlotBoard({ readings, onEdit, onDelete }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {SLOT_META.map((meta, index) => {
        const reading = readings.find((item) => item.slot === meta.slot);
        const Icon = meta.icon;
        const tone = reading ? glucoseTone(reading.value) : null;

        return (
          <motion.article
            key={meta.slot}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-3xl p-4 ring-1 ${
              reading
                ? 'bg-white/90 ring-stone-200/80 shadow-sm'
                : 'border border-dashed border-stone-300 bg-stone-50/70 ring-0'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-100 text-stone-700">
                <Icon className="h-4 w-4" />
              </span>
              {reading ? (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
                  {reading.value} mg/dl
                </span>
              ) : (
                <span className="text-xs font-medium text-stone-400">Empty</span>
              )}
            </div>
            <h3 className="mt-4 font-medium text-stone-900">{meta.slot}</h3>
            {reading ? (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  onClick={() => onEdit(reading)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  onClick={() => onDelete(reading)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-400">No value yet</p>
            )}
          </motion.article>
        );
      })}
    </div>
  );
}
