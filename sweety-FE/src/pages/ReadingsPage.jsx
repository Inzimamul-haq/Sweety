import { motion } from 'framer-motion';
import { AlertCircle, BarChart3, CalendarDays, CheckCircle2, Droplets, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorPayload } from '../api/client.js';
import { SLOT_META } from '../constants/slots.js';
import { useToast } from '../components/ui/ToastContext.jsx';
import { ReadingForm } from '../features/readings/components/ReadingForm.jsx';
import { ReadingList } from '../features/readings/components/ReadingList.jsx';
import { useReadings } from '../features/readings/useReadings.js';
import { formatPretty, todayISO } from '../utils/date.js';

export function ReadingsPage() {
  const [date, setDate] = useState(todayISO());
  const { readings, loading, error, refresh, add, edit, remove } = useReadings(date);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const usedSlots = useMemo(() => readings.map((reading) => reading.slot), [readings]);
  const atLimit = readings.length >= 4 && !editing;

  useEffect(() => {
    if (error?.message) {
      toast.error(error.message, 'Failed to Load Readings');
    }
  }, [error, toast]);

  async function handleCreate(payload) {
    await add({ ...payload, date });
    toast.success('Reading logged successfully!');
  }

  async function handleUpdate(payload) {
    await edit(editing.id, payload);
    setEditing(null);
    toast.success('Reading updated successfully!');
    if (payload.date !== date) setDate(payload.date);
  }

  async function handleDelete(reading) {
    const confirmed = window.confirm(`Delete the ${reading.slot} reading?`);
    if (!confirmed) return;
    try {
      await remove(reading.id);
      toast.success(`${reading.slot} reading deleted.`);
      if (editing?.id === reading.id) setEditing(null);
    } catch (err) {
      const payload = getErrorPayload(err);
      toast.error(payload.message, 'Delete Failed');
    }
  }

  return (
    <div className="flex flex-col gap-3.5 lg:h-[calc(100vh-100px)] lg:overflow-hidden">
      {/* 1. Sleek Compact Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
              Readings
            </h1>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
              Journal
            </span>
          </div>
          <p className="text-xs font-medium text-stone-500">
            Today’s log · <span className="text-stone-700">{formatPretty(date)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 shadow-2xs ring-1 ring-stone-200">
            <CalendarDays className="h-4 w-4 text-stone-500" />
            <input
              type="date"
              max={todayISO()}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setEditing(null);
              }}
              className="bg-transparent text-xs font-medium outline-none cursor-pointer text-stone-700"
            />
          </label>
        </div>
      </div>

      {/* Mobile-only View Reports Button */}
      <div className="sm:hidden shrink-0">
        <Link
          to="/reports"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-rose-800 shadow-2xs ring-1 ring-stone-200 hover:bg-stone-50 transition"
        >
          <BarChart3 className="h-4 w-4" />
          <span>View Reports</span>
        </Link>
      </div>

      {/* 2. Bento Grid Layout (Fits neatly in 1 single frame on laptop/desktop) */}
      <div className="grid gap-3.5 lg:grid-cols-12 flex-1 min-h-0">
        {/* Left Column: Form & Slots progress stacked */}
        <div className="flex flex-col gap-3.5 lg:col-span-5">
          {/* Add / Edit Reading Card */}
          <motion.section
            layout
            className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-stone-200/80 flex flex-col justify-between"
          >
            <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-rose-800" />
                <h2 className="font-display text-lg font-bold text-stone-900">
                  {editing ? 'Edit reading' : 'Add a reading'}
                </h2>
              </div>
              {editing ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                  Editing {editing.slot}
                </span>
              ) : null}
            </div>

            {atLimit ? (
              <div className="rounded-xl bg-stone-50/80 p-4 text-center">
                <p className="text-xs font-medium text-stone-600">
                  All 4 daily slots are filled.
                </p>
                <p className="mt-1 text-[11px] text-stone-400">
                  Edit or delete any reading on the right to change values.
                </p>
              </div>
            ) : (
              <ReadingForm
                key={editing ? `edit-${editing.id}` : `create-${date}-${readings.length}`}
                date={date}
                usedSlots={usedSlots}
                initial={editing}
                submitLabel={editing ? 'Save changes' : 'Save reading'}
                onSubmit={editing ? handleUpdate : handleCreate}
                onCancel={editing ? () => setEditing(null) : undefined}
              />
            )}
          </motion.section>

          {/* Slots Filled Bento Summary */}
          <motion.section
            layout
            className="rounded-2xl bg-rose-800 p-4 text-rose-50 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-200 uppercase tracking-wider">
                  Slots filled
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-white">
                    {readings.length}
                  </span>
                  <span className="text-sm font-semibold text-rose-200">/ 4 today</span>
                </div>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white">
                <Droplets className="h-5 w-5" />
              </span>
            </div>

            <p className="mt-2 text-xs text-rose-100/90 leading-relaxed">
              One value per slot. Used slots stay locked until you edit or delete them.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {SLOT_META.map((meta) => {
                const filled = usedSlots.includes(meta.slot);
                const Icon = meta.icon;
                return (
                  <div
                    key={meta.slot}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                      filled
                        ? 'bg-white/20 text-white'
                        : 'bg-black/15 text-rose-200/60'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{meta.short}</span>
                    {filled ? (
                      <CheckCircle2 className="ml-auto h-3 w-3 text-rose-200" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* Right Column: This Day's Readings (Full Bento Frame) */}
        <section className="flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-stone-200/80 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2.5 shrink-0">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">
                This day’s readings
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {readings.length === 0
                  ? 'No entries logged yet'
                  : `${readings.length} of 4 slots logged`}
              </p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
              {readings.length}/4
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-xs text-stone-400">
                Loading readings…
              </div>
            ) : error ? (
              <div className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error.message}</span>
                </div>
                <button
                  type="button"
                  onClick={refresh}
                  className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-rose-800 shadow-2xs ring-1 ring-rose-200 hover:bg-rose-50 transition cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              </div>
            ) : (
              <ReadingList readings={readings} onEdit={setEditing} onDelete={handleDelete} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
