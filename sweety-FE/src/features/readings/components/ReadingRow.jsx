import { Coffee, Moon, Pencil, Sunrise, Trash2, Utensils } from 'lucide-react';
import { glucoseTone } from '../../../utils/date.js';

const icons = {
  'Morning (fasting)': Sunrise,
  'After breakfast': Coffee,
  'After lunch': Utensils,
  'After dinner': Moon,
};

const tones = {
  low: 'bg-sky-50 text-sky-800',
  ok: 'bg-emerald-50 text-emerald-800',
  high: 'bg-rose-50 text-rose-800',
};

export function ReadingRow({ reading, onEdit, onDelete }) {
  const Icon = icons[reading.slot] || Sunrise;
  const tone = glucoseTone(reading.value);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-stone-200/80">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-stone-100 text-stone-700">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-stone-900">{reading.slot}</p>
          <p className="text-sm text-stone-500">mg/dl</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${tones[tone]}`}>
          {reading.value}
        </span>
        <button
          type="button"
          className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          onClick={() => onEdit(reading)}
          aria-label="Edit reading"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded-xl p-2 text-stone-500 hover:bg-rose-50 hover:text-rose-700"
          onClick={() => onDelete(reading)}
          aria-label="Delete reading"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
