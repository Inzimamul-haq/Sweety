import { EmptyState } from './EmptyState.jsx';

export function RangeReport({ report }) {
  if (!report || report.stats.count === 0) {
    return (
      <EmptyState
        title="Nothing in this range"
        body="There are no readings between these dates yet. Try another day, or log a few values first."
      />
    );
  }

  return (
    <p className="rounded-3xl bg-white/70 px-5 py-4 text-sm text-stone-600 ring-1 ring-stone-200/80">
      Summary across {report.stats.count} reading{report.stats.count === 1 ? '' : 's'} in{' '}
      <span className="font-semibold text-stone-800">{report.range.label}</span>.
    </p>
  );
}
