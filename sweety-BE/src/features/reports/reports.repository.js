import { pool } from '../../config/db.js';

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

export async function listInRange({ userId, from, to, page, limit }) {
  const params = [userId, from, to];
  let paginationSql = '';

  if (limit) {
    const offset = page && page > 1 ? (page - 1) * limit : 0;
    params.push(limit, offset);
    paginationSql = `LIMIT $4 OFFSET $5`;
  }

  const { rows } = await pool.query(
    `SELECT id, reading_date, slot, value
     FROM readings
     WHERE user_id = $1
       AND reading_date BETWEEN $2 AND $3
     ORDER BY reading_date ASC,
       CASE slot
         WHEN 'Morning (fasting)' THEN 1
         WHEN 'After breakfast' THEN 2
         WHEN 'After lunch' THEN 3
         WHEN 'After dinner' THEN 4
         ELSE 5
       END ASC
     ${paginationSql}`,
    params,
  );

  return rows.map(mapReading);
}
