import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { SLOT_META } from '../../../constants/slots.js';
import { formatPretty, glucoseTone } from '../../../utils/date.js';
import { EmptyState } from './EmptyState.jsx';

const tones = {
  low: 'text-sky-700 bg-sky-50 border-sky-200/60',
  ok: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
  high: 'text-rose-700 bg-rose-50 border-rose-200/60',
};

export function RangeReport({ report, onPageChange, loadingPage }) {
  const readings = useMemo(
    () => (Array.isArray(report?.readings) ? report.readings : []),
    [report],
  );

  const total = report?.pagination?.total ?? report?.stats?.count ?? 0;
  const page = report?.pagination?.page ?? 1;
  const limit = report?.pagination?.limit ?? 20;
  const totalPages = report?.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));

  // Group readings by date: one row/card per date
  const groupedByDate = useMemo(() => {
    const groups = {};
    for (const reading of readings) {
      if (!groups[reading.date]) {
        groups[reading.date] = [];
      }
      groups[reading.date].push(reading);
    }

    return Object.entries(groups).map(([date, items]) => {
      const values = items.map((r) => r.value);
      const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      const min = Math.min(...values);
      const max = Math.max(...values);
      return {
        date,
        readings: items,
        count: items.length,
        average: avg,
        min,
        max,
      };
    });
  }, [readings]);

  if (!report || total === 0) {
    return (
      <EmptyState
        title="Nothing in this range"
        body="There are no readings between these dates yet. Try another day, or log a few values first."
      />
    );
  }

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white/90 p-3.5 shadow-sm ring-1 ring-stone-200/80">
      {/* 1. Range Summary Header (Clean summary, no filter dropdowns) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2.5 shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
            Log Breakdown
          </span>
          <p className="text-xs font-semibold text-stone-800">
            <span className="font-bold text-stone-900">{total} readings</span> in{' '}
            <span className="font-semibold text-rose-900">{report.range?.label}</span>
          </p>
        </div>
        <p className="text-[11px] text-stone-500 font-medium">
          Showing {startRecord}–{endRecord} of {total}
        </p>
      </div>

      {/* 2. Date Rows Table (Cleverly formatted for 1-frame dashboard) */}
      <div
        className={`flex-1 overflow-y-auto py-2 pr-1 transition-opacity space-y-2 ${
          loadingPage ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {groupedByDate.map((group) => {
          return (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 rounded-xl bg-stone-50/70 p-2.5 ring-1 ring-stone-200/80 transition hover:bg-stone-50 xl:flex-row xl:items-center xl:justify-between shadow-2xs"
            >
              {/* Left: Date & Readings Count */}
              <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-stone-700 shadow-2xs ring-1 ring-stone-200/70">
                  <Calendar className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">
                    {formatPretty(group.date)}
                  </h3>
                  <p className="text-[10px] text-stone-400 font-medium">
                    {group.count} {group.count === 1 ? 'log' : 'logs'}
                  </p>
                </div>
              </div>

              {/* Center: Meal slots for that date */}
              <div className="flex flex-wrap items-center gap-1 flex-1">
                {SLOT_META.map((meta) => {
                  const r = group.readings.find((item) => item.slot === meta.slot);
                  if (!r) {
                    return (
                      <div
                        key={meta.slot}
                        className="flex items-center gap-1 rounded-lg border border-dashed border-stone-200/70 bg-white/40 px-1.5 py-0.5 text-[10px] text-stone-400"
                      >
                        <meta.icon className="h-3 w-3 shrink-0 opacity-40" />
                        <span className="truncate">{meta.short}</span>
                        <span className="text-stone-300">—</span>
                      </div>
                    );
                  }

                  const tone = glucoseTone(r.value);
                  return (
                    <div
                      key={r.id || meta.slot}
                      className={`flex items-center gap-1 rounded-lg border bg-white px-2 py-0.5 text-[10px] shadow-2xs ${tones[tone]}`}
                    >
                      <meta.icon className="h-3 w-3 shrink-0" />
                      <span className="font-semibold text-stone-700">{meta.short}:</span>
                      <span className="font-extrabold">{r.value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Right: Lowest, Average, Highest directly visible */}
              <div className="flex items-center gap-1 shrink-0 border-t border-stone-200/60 pt-1.5 xl:border-t-0 xl:pt-0">
                <div className="rounded-lg bg-white px-2 py-0.5 text-center shadow-2xs ring-1 ring-stone-200/70 min-w-[55px]">
                  <p className="text-[9px] font-bold uppercase text-stone-400">
                    Min
                  </p>
                  <p className="text-[11px] font-extrabold text-stone-800">{group.min}</p>
                </div>
                <div className="rounded-lg bg-rose-50/90 px-2 py-0.5 text-center shadow-2xs ring-1 ring-rose-200/60 min-w-[60px]">
                  <p className="text-[9px] font-bold uppercase text-rose-600">
                    Avg
                  </p>
                  <p className="text-[11px] font-extrabold text-rose-900">{group.average}</p>
                </div>
                <div className="rounded-lg bg-white px-2 py-0.5 text-center shadow-2xs ring-1 ring-stone-200/70 min-w-[55px]">
                  <p className="text-[9px] font-bold uppercase text-stone-400">
                    Max
                  </p>
                  <p className="text-[11px] font-extrabold text-stone-800">{group.max}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Footer Pagination Bar */}
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/70 pt-2 shrink-0">
          <p className="text-[11px] text-stone-500 font-medium">
            Page <span className="font-bold text-stone-800">{page}</span> of{' '}
            <span className="font-bold text-stone-800">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || loadingPage}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-stone-700 shadow-2xs ring-1 ring-stone-200 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis ? <span className="px-0.5 text-xs text-stone-400">…</span> : null}
                      <button
                        type="button"
                        disabled={loadingPage}
                        onClick={() => onPageChange(p)}
                        className={`h-6 min-w-6 rounded-md px-1.5 text-xs font-semibold transition cursor-pointer ${
                          p === page
                            ? 'bg-rose-800 text-white shadow-2xs'
                            : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={page >= totalPages || loadingPage}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-stone-700 shadow-2xs ring-1 ring-stone-200 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
