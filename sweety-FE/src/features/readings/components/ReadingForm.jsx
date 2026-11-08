import { useState } from 'react';
import { getErrorPayload } from '../../../api/client.js';
import { SLOT_META } from '../../../constants/slots.js';
import { Button } from '../../../components/ui/Button.jsx';
import { ErrorMessage } from '../../../components/ui/ErrorMessage.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { useToast } from '../../../components/ui/ToastContext.jsx';
import { todayISO } from '../../../utils/date.js';
import { validateReading } from '../readings.validation.js';

export function ReadingForm({
  date,
  usedSlots,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    date: initial?.date || date,
    slot: initial?.slot || '',
    value: initial?.value ?? '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      if (error?.field === field) setError(null);
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Frontend validation with Zod before making request
    const validation = validateReading(form);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(validation.data);
    } catch (err) {
      const payload = getErrorPayload(err);
      setError(payload);
      toast.error(payload.message, initial ? 'Update Failed' : 'Add Reading Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {initial ? (
        <Input
          label="Date"
          name="date"
          type="date"
          max={todayISO()}
          value={form.date}
          error={error?.field === 'date'}
          onChange={update('date')}
          className="py-1.5 text-sm"
        />
      ) : null}

      <fieldset>
        <legend className="mb-1 block text-xs font-semibold text-stone-600">Slot</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {SLOT_META.map((meta) => {
            const taken = usedSlots.includes(meta.slot) && meta.slot !== initial?.slot;
            const selected = form.slot === meta.slot;
            const Icon = meta.icon;
            return (
              <button
                key={meta.slot}
                type="button"
                disabled={taken}
                onClick={() => {
                  setForm((current) => ({ ...current, slot: meta.slot }));
                  if (error?.field === 'slot') setError(null);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected
                    ? 'bg-rose-800 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 ring-1 ring-stone-200/80 hover:bg-white'
                } ${error?.field === 'slot' && !selected ? 'ring-rose-300' : ''}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="leading-tight truncate">{meta.short}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600" htmlFor="glucose-input">
          Glucose (mg/dl)
        </label>
        <input
          id="glucose-input"
          name="value"
          type="number"
          inputMode="numeric"
          min="40"
          max="600"
          step="1"
          placeholder="e.g. 110"
          value={form.value}
          onChange={update('value')}
          className={`w-full rounded-xl border bg-white/90 px-3 py-1.5 text-sm text-stone-900 shadow-2xs outline-none transition placeholder:text-stone-400 focus:ring-3 ${
            error?.field === 'value'
              ? 'border-rose-400 ring-2 ring-rose-200'
              : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
          }`}
        />
      </div>

      <ErrorMessage>{error?.message}</ErrorMessage>

      <div className="flex flex-wrap gap-2 pt-0.5">
        <Button type="submit" loading={loading} className="py-2 px-4 text-xs font-semibold">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} className="py-2 px-3 text-xs">
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
