import { motion } from 'framer-motion';
import { Activity, CalendarDays, Hash, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getErrorPayload } from '../api/client.js';
import { DailyReport } from '../features/reports/components/DailyReport.jsx';
import { RangeReport } from '../features/reports/components/RangeReport.jsx';
import { StatsCard } from '../features/reports/components/StatsCard.jsx';
import {
  fetchDailyReport,
  fetchMonthToDateReport,
  fetchMonthlyReport,
} from '../features/reports/reports.api.js';
import { todayISO } from '../utils/date.js';

const tabs = [
  { id: 'daily', label: 'Daily' },
  { id: 'month-to-date', label: 'Month to date' },
  { id: 'monthly', label: 'Previous month' },
];

export function ReportsPage() {
  const [date, setDate] = useState(todayISO());
  const [tab, setTab] = useState('daily');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loader =
          tab === 'daily'
            ? fetchDailyReport
            : tab === 'month-to-date'
              ? fetchMonthToDateReport
              : fetchMonthlyReport;
        const data = await loader(date);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) setError(getErrorPayload(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [date, tab]);

  const stats = report?.stats || { highest: null, lowest: null, average: null, count: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-rose-800">Patterns</p>
          <h1 className="font-display text-3xl text-stone-900 sm:text-4xl">Reports</h1>
          <p className="mt-1 text-stone-500">{report?.range.label || 'Choose a date'}</p>
        </div>
        <label className="flex w-full items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-stone-200 sm:w-auto">
          <CalendarDays className="h-4 w-4 text-stone-500" />
          <input
            type="date"
            max={todayISO()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? 'bg-rose-800 text-white'
                : 'bg-white/80 text-stone-600 ring-1 ring-stone-200 hover:bg-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-700">{error.message}</p> : null}

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Highest"
          value={stats.highest}
          unit="mg/dl"
          icon={TrendingUp}
          featured
          className="sm:col-span-2 lg:row-span-2"
        />
        <StatsCard label="Lowest" value={stats.lowest} unit="mg/dl" icon={TrendingDown} />
        <StatsCard label="Average" value={stats.average} unit="mg/dl, 1 decimal" icon={Activity} />
        <StatsCard
          label="Count"
          value={stats.count}
          unit="readings in this range"
          icon={Hash}
          className="sm:col-span-2"
        />
      </div>

      <motion.section layout className="min-h-40">
        {loading ? (
          <p className="text-sm text-stone-500">Loading report…</p>
        ) : tab === 'daily' ? (
          <DailyReport report={report} />
        ) : (
          <RangeReport report={report} />
        )}
      </motion.section>
    </div>
  );
}
