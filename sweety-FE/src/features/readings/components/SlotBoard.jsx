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
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {SLOT_META.map((meta, index) => {
        const reading = readings.find((item) => item.slot === meta.slot);
        const Icon = meta.icon;
        const tone = reading ? glucoseTone(reading.value) : null;

        return (
          <motion.article
            key={meta.slot}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`flex flex-col justify-between rounded-2xl p-3.5 transition shadow-2xs ${
              reading
                ? 'bg-white/95 ring-1 ring-stone-200/80 hover:shadow-xs'
                : 'border border-dashed border-stone-200 bg-stone-50/60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-xl ${
                    reading ? 'bg-stone-100 text-stone-700' : 'bg-stone-100/60 text-stone-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className={`text-xs font-semibold ${reading ? 'text-stone-900' : 'text-stone-500'}`}>
                    {meta.slot}
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    {reading ? 'Logged' : 'No value yet'}
                  </p>
                </div>
              </div>

              {reading ? (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tones[tone]}`}>
                  {reading.value} mg/dl
                </span>
              ) : (
                <span className="rounded-full bg-stone-100/80 px-2 py-0.5 text-[10px] font-semibold text-stone-400">
                  Empty
                </span>
              )}
            </div>

            {reading ? (
              <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-stone-100 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                  onClick={() => onEdit(reading)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                  onClick={() => onDelete(reading)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
}
