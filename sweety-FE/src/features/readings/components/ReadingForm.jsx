import { useState } from 'react';
import { getErrorPayload } from '../../../api/client.js';
import { SLOT_META } from '../../../constants/slots.js';
import { Button } from '../../../components/ui/Button.jsx';
import { ErrorMessage } from '../../../components/ui/ErrorMessage.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { todayISO } from '../../../utils/date.js';

function clientValidate({ value, date, slot }) {
  if (value === '' || value === null || value === undefined) {
    return { message: 'Please enter a glucose value.', field: 'value' };
  }

  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 40 || numeric > 600) {
    return { message: 'Value must be between 40 and 600 mg/dl.', field: 'value' };
  }

  if (date > todayISO()) {
    return { message: 'Date cannot be in the future.', field: 'date' };
  }

  if (!slot) {
    return { message: 'Please select a valid slot.', field: 'slot' };
  }

  return null;
}

export function ReadingForm({
  date,
  usedSlots,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    date: initial?.date || date,
    slot: initial?.slot || '',
    value: initial?.value ?? '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const localError = clientValidate(form);
    if (localError) {
      setError(localError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        date: form.date,
        slot: form.slot,
        value: Number(form.value),
      });
    } catch (err) {
      setError(getErrorPayload(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {initial ? (
        <Input
          label="Date"
          name="date"
          type="date"
          max={todayISO()}
          value={form.date}
          error={error?.field === 'date'}
          onChange={update('date')}
        />
      ) : null}

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-stone-600">Slot</legend>
        <div className="grid grid-cols-2 gap-2">
          {SLOT_META.map((meta) => {
            const taken = usedSlots.includes(meta.slot) && meta.slot !== initial?.slot;
            const selected = form.slot === meta.slot;
            const Icon = meta.icon;
            return (
              <button
                key={meta.slot}
                type="button"
                disabled={taken}
                onClick={() => setForm((current) => ({ ...current, slot: meta.slot }))}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected
                    ? 'bg-rose-800 text-white shadow-sm'
                    : 'bg-stone-50 text-stone-700 ring-1 ring-stone-200 hover:bg-white'
                } ${error?.field === 'slot' && !selected ? 'ring-rose-300' : ''}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="leading-tight">{meta.short}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Input
        label="Glucose (mg/dl)"
        name="value"
        type="number"
        inputMode="numeric"
        min="40"
        max="600"
        step="1"
        value={form.value}
        error={error?.field === 'value'}
        onChange={update('value')}
      />
      <ErrorMessage>{error?.message}</ErrorMessage>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
