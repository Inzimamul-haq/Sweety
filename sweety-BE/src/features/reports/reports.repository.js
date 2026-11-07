import { supabase, throwIfError } from '../../config/db.js';
import { SLOTS } from '../../shared/constants/slots.js';

const SLOT_ORDER = Object.fromEntries(SLOTS.map((slot, index) => [slot, index]));

function mapReading(row) {
  return {
    id: row.id,
    date: row.reading_date,
    slot: row.slot,
    value: row.value,
  };
}

export async function getStats({ userId, from, to }) {
  const { data, error } = await supabase.rpc('reading_stats', {
    p_user_id: userId,
    p_from: from,
    p_to: to,
  });

  throwIfError(error);

  const row = Array.isArray(data) ? data[0] : data;
  const count = Number(row?.count || 0);

  if (!row || count === 0) {
    return { highest: null, lowest: null, average: null, count: 0 };
  }

  return {
    highest: row.highest,
    lowest: row.lowest,
    average: row.average === null ? null : Number(row.average),
    count,
  };
}

export async function listInRange({ userId, from, to }) {
  const { data, error } = await supabase
    .from('readings')
    .select('id, reading_date, slot, value')
    .eq('user_id', userId)
    .gte('reading_date', from)
    .lte('reading_date', to)
    .order('reading_date', { ascending: true });

  throwIfError(error);

  return [...(data || [])]
    .sort((a, b) => {
      const byDate = a.reading_date.localeCompare(b.reading_date);
      if (byDate !== 0) return byDate;
      return SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot];
    })
    .map(mapReading);
}
