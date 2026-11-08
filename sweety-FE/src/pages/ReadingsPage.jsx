import { motion } from 'framer-motion';
import { AlertCircle, CalendarDays, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-rose-800">Today’s log</p>
          <h1 className="font-display text-3xl text-stone-900 sm:text-4xl">Readings</h1>
          <p className="mt-1 text-stone-500">{formatPretty(date)}</p>
        </div>
        <label className="flex w-full items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-stone-200 sm:w-auto">
          <CalendarDays className="h-4 w-4 text-stone-500" />
          <input
            type="date"
            max={todayISO()}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setEditing(null);
            }}
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <motion.section
          layout
          className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/80 lg:col-span-7"
        >
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-rose-800" />
            <h2 className="font-display text-2xl">
              {editing ? 'Edit reading' : 'Add a reading'}
            </h2>
          </div>
          {atLimit ? (
            <p className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-600">
              You can add only 4 readings per day. Edit or delete one to make space.
            </p>
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

        <motion.section
          layout
          className="rounded-3xl bg-rose-800 p-5 text-rose-50 shadow-sm lg:col-span-5"
        >
          <p className="text-sm text-rose-100">Slots filled</p>
          <p className="mt-2 font-display text-5xl">{readings.length}/4</p>
          <p className="mt-4 max-w-xs text-sm text-rose-100">
            One value per slot. Used slots stay disabled until you edit or delete them.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {SLOT_META.map((meta) => {
              const filled = usedSlots.includes(meta.slot);
              const Icon = meta.icon;
              return (
                <div
                  key={meta.slot}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-sm ${
                    filled ? 'bg-white/15' : 'bg-black/10 text-rose-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {meta.short}
                </div>
              );
            })}
          </div>
        </motion.section>

        <section className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/80 lg:col-span-12">
          <h2 className="mb-4 font-display text-2xl">This day’s readings</h2>
          {loading ? (
            <p className="text-sm text-stone-500">Loading readings…</p>
          ) : error ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                <span>{error.message}</span>
              </div>
              <button
                type="button"
                onClick={refresh}
                className="flex items-center gap-1.5 self-start rounded-xl bg-white px-3 py-1.5 font-semibold text-rose-800 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <ReadingList readings={readings} onEdit={setEditing} onDelete={handleDelete} />
          )}
        </section>
      </div>
    </div>
  );
}
