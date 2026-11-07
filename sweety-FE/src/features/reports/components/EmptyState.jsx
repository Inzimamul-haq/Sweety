import { Droplets } from 'lucide-react';

export function EmptyState({ title, body }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl bg-white/70 px-6 py-16 text-center ring-1 ring-stone-200/80">
      <span className="grid h-14 w-14 place-items-center rounded-3xl bg-rose-50 text-rose-800">
        <Droplets className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-2xl text-stone-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-stone-500">{body}</p>
    </div>
  );
}
