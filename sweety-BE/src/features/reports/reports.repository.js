import { pool } from '../../config/db.js';
import { SLOTS } from '../../shared/constants/slots.js';

const SLOT_ORDER = Object.fromEntries(SLOTS.map((slot, index) => [slot, index]));

function mapReading(row) {
  const dateStr = typeof row.reading_date === 'string'
    ? row.reading_date
    : row.reading_date instanceof Date
      ? row.reading_date.toISOString().slice(0, 10)
      : String(row.reading_date);

  return {
    id: row.id,
    date: dateStr,
    slot: row.slot,
    value: row.value,
  };
}

export async function getStats({ userId, from, to }) {
  const { rows } = await pool.query(
    `SELECT
       MAX(value)::int AS highest,
       MIN(value)::int AS lowest,
       ROUND(AVG(value)::numeric, 1)::float AS average,
       COUNT(*)::int AS count
     FROM readings
     WHERE user_id = $1
       AND reading_date BETWEEN $2 AND $3`,
    [userId, from, to],
  );

  const row = rows[0];
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
  const { rows } = await pool.query(
    `SELECT id, reading_date, slot, value
     FROM readings
     WHERE user_id = $1
       AND reading_date BETWEEN $2 AND $3
     ORDER BY reading_date ASC`,
    [userId, from, to],
  );

  return [...rows]
    .sort((a, b) => {
      const dateA = typeof a.reading_date === 'string'
        ? a.reading_date
        : a.reading_date instanceof Date
          ? a.reading_date.toISOString().slice(0, 10)
          : String(a.reading_date);
      const dateB = typeof b.reading_date === 'string'
        ? b.reading_date
        : b.reading_date instanceof Date
          ? b.reading_date.toISOString().slice(0, 10)
          : String(b.reading_date);

      const byDate = dateA.localeCompare(dateB);
      if (byDate !== 0) return byDate;
      return SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot];
    })
    .map(mapReading);
}
