import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Eye,
  Hash,
  Plus,
  RefreshCw,
  Stethoscope,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorPayload } from '../api/client.js';
import { useToast } from '../components/ui/ToastContext.jsx';
import { fetchDoctorPatientReport } from '../features/doctor/doctor.api.js';
import { DailyReport } from '../features/reports/components/DailyReport.jsx';
import { RangeReport } from '../features/reports/components/RangeReport.jsx';
import { StatsCard } from '../features/reports/components/StatsCard.jsx';
import { TrendChart } from '../features/reports/components/TrendChart.jsx';
import {
  fetchDailyReport,
  fetchMonthToDateReport,
  fetchMonthlyReport,
  fetchWeeklyReport,
} from '../features/reports/reports.api.js';
import { todayISO } from '../utils/date.js';

const tabs = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'month-to-date', label: 'Month to date' },
  { id: 'monthly', label: 'Previous month' },
];

export function ReportsPage({ patientId = null }) {
  const isDoctorView = Boolean(patientId);
  const [date, setDate] = useState(todayISO());
  const [tab, setTab] = useState('month-to-date');
  const [page, setPage] = useState(1);
  const [report, setReport] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();

  const handleTabChange = (newTab) => {
    if (newTab === tab) return;
    setTab(newTab);
    setPage(1);
    setLoading(true);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setPage(1);
    setLoading(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setLoadingPage(true);
  };

  const retry = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      try {
        if (isDoctorView) {
          const result = await fetchDoctorPatientReport(patientId, tab, date, page, 20);
          if (!cancelled) {
            setReport(result.report);
            setPatient(result.patient || null);
            setError(null);
          }
        } else {
          let data;
          if (tab === 'daily') {
            data = await fetchDailyReport(date);
          } else if (tab === 'weekly') {
            data = await fetchWeeklyReport(date, page, 20);
          } else if (tab === 'month-to-date') {
            data = await fetchMonthToDateReport(date, page, 20);
          } else {
            data = await fetchMonthlyReport(date, page, 20);
          }

          if (!cancelled) {
            setReport(data);
            setError(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const payload = getErrorPayload(err);
          setError(payload);
          toast.error(payload.message, 'Failed to Load Report');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingPage(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [date, tab, page, reloadKey, isDoctorView, patientId, toast]);

  const isMatchingKind = report && report.kind === tab;
  const stats = (isMatchingKind ? report.stats : null) || {
    highest: null,
    lowest: null,
    average: null,
    count: 0,
  };

  return (
    <div className="flex flex-col gap-3 lg:h-[calc(100vh-95px)] lg:overflow-hidden">
      {/* Doctor Read-Only Banner when viewing a patient's reports */}
      {isDoctorView ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-white/95 px-4 py-2.5 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/doctor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/80 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to patients
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-900">
                <Eye className="h-4 w-4 text-rose-700" />
                Viewing {patient?.name || 'Patient'}
              </span>
              {patient?.email ? (
                <span className="text-xs text-stone-500">({patient.email})</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patient?.connectedDoctor?.name ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-200/60">
                <Stethoscope className="h-3 w-3" />
                Connected to {patient.connectedDoctor.name}
              </span>
            ) : null}
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
              Read-only view
            </span>
          </div>
        </div>
      ) : null}

      {/* 1. Compact Dashboard Header (Title, Tabs, Date picker in 1 line on desktop) */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
              {isDoctorView && patient?.name ? `${patient.name}’s Reports` : 'Reports'}
            </h1>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
              {isDoctorView ? 'Clinical Review' : 'Analytics'}
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            {isMatchingKind ? report?.range?.label : 'Loading report data…'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Selector */}
          <div className="flex items-center rounded-xl bg-white/90 p-1 shadow-2xs ring-1 ring-stone-200">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  tab === item.id
                    ? 'bg-rose-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <label className="flex items-center gap-1.5 rounded-xl bg-white/90 px-2.5 py-1 shadow-2xs ring-1 ring-stone-200">
            <CalendarDays className="h-4 w-4 text-stone-500" />
            <input
              type="date"
              max={todayISO()}
              value={date}
              onChange={(event) => handleDateChange(event.target.value)}
              className="bg-transparent text-xs font-medium outline-none cursor-pointer text-stone-700"
            />
          </label>
        </div>
      </div>

      {/* Mobile-only Add Reading Navigation Button (Hidden in Doctor Read-Only View) */}
      {!isDoctorView ? (
        <div className="sm:hidden shrink-0">
          <Link
            to="/readings"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-900 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Reading</span>
          </Link>
        </div>
      ) : null}

      {/* Error alert if any */}
      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-xs text-rose-900 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error.message}</span>
          </div>
          <button
            type="button"
            onClick={retry}
            className="flex items-center gap-1 rounded-lg bg-white px-2 py-0.5 text-xs font-semibold text-rose-800 shadow-2xs ring-1 ring-rose-200 hover:bg-rose-50"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : null}

      {/* 2. Compact 4-KPI Metric Strip in 1 single horizontal line */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 shrink-0">
        <StatsCard
          label="Highest"
          value={stats.highest}
          unit="mg/dl"
          icon={TrendingUp}
        />
        <StatsCard
          label="Lowest"
          value={stats.lowest}
          unit="mg/dl"
          icon={TrendingDown}
        />
        <StatsCard
          label="Average"
          value={stats.average}
          unit="mg/dl"
          icon={Activity}
        />
        <StatsCard
          label="Total Readings"
          value={stats.count}
          unit="in range"
          icon={Hash}
        />
      </div>

      {/* 3. Main Bento Grid (Flowchart on Left, Log Table on Right) */}
      <div className="flex-1 min-h-0 grid gap-3 lg:grid-cols-12">
        {loading || !isMatchingKind ? (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-white/60 p-8 text-xs text-stone-400 ring-1 ring-stone-200/60 lg:col-span-12">
            <span>Loading {tab} report…</span>
          </div>
        ) : (
          <>
            {/* Left Bento Tile: Professional Trend Chart */}
            <div className="flex flex-col rounded-2xl bg-white/90 p-3.5 shadow-sm ring-1 ring-stone-200/80 lg:col-span-5 xl:col-span-6 h-full min-h-[220px]">
              <TrendChart report={report} />
            </div>

            {/* Right Bento Tile: Detailed Log Table */}
            <div className="flex flex-col lg:col-span-7 xl:col-span-6 h-full min-h-[260px]">
              {tab === 'daily' ? (
                <DailyReport report={report} readOnly={isDoctorView} />
              ) : (
                <RangeReport
                  report={report}
                  onPageChange={handlePageChange}
                  loadingPage={loadingPage}
                  readOnly={isDoctorView}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
