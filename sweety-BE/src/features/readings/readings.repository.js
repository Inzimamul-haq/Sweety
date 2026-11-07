import { supabase, throwIfError } from '../../config/db.js';
import { SLOTS } from '../../shared/constants/slots.js';

const SLOT_ORDER = Object.fromEntries(SLOTS.map((slot, index) => [slot, index]));

function mapReading(row) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.reading_date,
    slot: row.slot,
    value: row.value,
    createdAt: row.created_at,
  };
}

function sortBySlot(rows) {
  return [...rows].sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);
}

export async function insertReading({ userId, date, slot, value }) {
  const { data, error } = await supabase
    .from('readings')
    .insert({
      user_id: userId,
      reading_date: date,
      slot,
      value,
    })
    .select('id, user_id, reading_date, slot, value, created_at')
    .single();

  throwIfError(error);
  return mapReading(data);
}

export async function updateReading({ id, userId, date, slot, value }) {
  const { data, error } = await supabase
    .from('readings')
    .update({
      reading_date: date,
      slot,
      value,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, user_id, reading_date, slot, value, created_at')
    .maybeSingle();

  throwIfError(error);
  return data ? mapReading(data) : null;
}

export async function deleteReading({ id, userId }) {
  const { data, error } = await supabase
    .from('readings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  throwIfError(error);
  return Boolean(data);
}

export async function findByIdForUser(id, userId) {
  const { data, error } = await supabase
    .from('readings')
    .select('id, user_id, reading_date, slot, value, created_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  throwIfError(error);
  return data ? mapReading(data) : null;
}

export async function listByUserAndDate(userId, date) {
  const { data, error } = await supabase
    .from('readings')
    .select('id, user_id, reading_date, slot, value, created_at')
    .eq('user_id', userId)
    .eq('reading_date', date);

  throwIfError(error);
  return sortBySlot(data || []).map(mapReading);
}

export async function findByUserDateSlot({ userId, date, slot, excludeId }) {
  let request = supabase
    .from('readings')
    .select('id')
    .eq('user_id', userId)
    .eq('reading_date', date)
    .eq('slot', slot)
    .limit(1);

  if (excludeId) {
    request = request.neq('id', excludeId);
  }

  const { data, error } = await request.maybeSingle();
  throwIfError(error);
  return data || null;
}

export async function countByUserDate({ userId, date, excludeId }) {
  let request = supabase
    .from('readings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('reading_date', date);

  if (excludeId) {
    request = request.neq('id', excludeId);
  }

  const { count, error } = await request;
  throwIfError(error);
  return count || 0;
}
