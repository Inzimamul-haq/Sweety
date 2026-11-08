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
    userId: row.user_id,
    date: dateStr,
    slot: row.slot,
    value: row.value,
    createdAt: row.created_at,
  };
}

function sortBySlot(rows) {
  return [...rows].sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);
}

export async function insertReading({ userId, date, slot, value }) {
  const { rows } = await pool.query(
    `INSERT INTO readings (user_id, reading_date, slot, value)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, reading_date, slot, value, created_at`,
    [userId, date, slot, value],
  );

  return mapReading(rows[0]);
}

export async function updateReading({ id, userId, date, slot, value }) {
  const { rows } = await pool.query(
    `UPDATE readings
     SET reading_date = $1, slot = $2, value = $3
     WHERE id = $4 AND user_id = $5
     RETURNING id, user_id, reading_date, slot, value, created_at`,
    [date, slot, value, id, userId],
  );

  return rows[0] ? mapReading(rows[0]) : null;
}

export async function deleteReading({ id, userId }) {
  const { rows } = await pool.query(
    `DELETE FROM readings
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId],
  );

  return rows.length > 0;
}

export async function findByIdForUser(id, userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, reading_date, slot, value, created_at
     FROM readings
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return rows[0] ? mapReading(rows[0]) : null;
}

export async function listByUserAndDate(userId, date) {
  const { rows } = await pool.query(
    `SELECT id, user_id, reading_date, slot, value, created_at
     FROM readings
     WHERE user_id = $1 AND reading_date = $2`,
    [userId, date],
  );

  return sortBySlot(rows).map(mapReading);
}

export async function findByUserDateSlot({ userId, date, slot, excludeId }) {
  let query = `
    SELECT id
    FROM readings
    WHERE user_id = $1 AND reading_date = $2 AND slot = $3
  `;
  const params = [userId, date, slot];

  if (excludeId) {
    params.push(excludeId);
    query += ` AND id != $${params.length}`;
  }

  query += ` LIMIT 1`;

  const { rows } = await pool.query(query, params);
  return rows[0] || null;
}

export async function countByUserDate({ userId, date, excludeId }) {
  let query = `
    SELECT COUNT(*)::int AS count
    FROM readings
    WHERE user_id = $1 AND reading_date = $2
  `;
  const params = [userId, date];

  if (excludeId) {
    params.push(excludeId);
    query += ` AND id != $${params.length}`;
  }

  const { rows } = await pool.query(query, params);
  return rows[0] ? rows[0].count : 0;
}
