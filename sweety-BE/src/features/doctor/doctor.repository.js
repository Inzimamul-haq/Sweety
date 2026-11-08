import { pool } from '../../config/db.js';

function formatDate(val) {
  if (!val) return null;
  if (typeof val === 'string') return val.slice(0, 10);
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function computeStatus(sevenDayAvg, lastValue) {
  const metric = sevenDayAvg !== null && sevenDayAvg !== undefined ? Number(sevenDayAvg) : lastValue;
  if (metric === null || metric === undefined) return 'no_data';
  if (metric < 70) return 'low';
  if (metric > 180) return 'high';
  return 'in_range';
}

function mapPatientSummary(row) {
  const sevenDayAverage =
    row.seven_day_avg !== null && row.seven_day_avg !== undefined
      ? Number(row.seven_day_avg)
      : null;

  const lastReading = row.last_reading_value
    ? {
        id: row.last_reading_id,
        value: Number(row.last_reading_value),
        slot: row.last_reading_slot,
        date: formatDate(row.last_reading_date),
      }
    : null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    linkedAt: row.linked_at,
    loggedToday: Boolean(row.logged_today),
    todayCount: Number(row.today_count || 0),
    sevenDayAverage,
    sevenDayCount: Number(row.seven_day_count || 0),
    lastReading,
    status: computeStatus(sevenDayAverage, lastReading?.value ?? null),
  };
}

export async function getDoctorStats(doctorId) {
  const { rows } = await pool.query(
    `WITH linked AS (
       SELECT dp.patient_id
       FROM doctor_patients dp
       WHERE dp.doctor_id = $1
     ),
     patient_metrics AS (
       SELECT
         l.patient_id,
         EXISTS (
           SELECT 1
           FROM readings r
           WHERE r.user_id = l.patient_id
             AND r.reading_date = CURRENT_DATE
         ) AS logged_today,
         (
           SELECT ROUND(AVG(r.value)::numeric, 1)::float
           FROM readings r
           WHERE r.user_id = l.patient_id
             AND r.reading_date >= CURRENT_DATE - INTERVAL '6 days'
             AND r.reading_date <= CURRENT_DATE
         ) AS avg_7d,
         (
           SELECT r.value
           FROM readings r
           WHERE r.user_id = l.patient_id
           ORDER BY r.reading_date DESC, r.created_at DESC
           LIMIT 1
         ) AS last_val
       FROM linked l
     )
     SELECT
       COUNT(*)::int AS total_patients,
       COUNT(*) FILTER (WHERE logged_today)::int AS logged_today,
       COUNT(*) FILTER (
         WHERE COALESCE(avg_7d, last_val) >= 70
           AND COALESCE(avg_7d, last_val) <= 180
       )::int AS in_range,
       COUNT(*) FILTER (
         WHERE COALESCE(avg_7d, last_val) < 70
            OR COALESCE(avg_7d, last_val) > 180
       )::int AS needs_attention
     FROM patient_metrics`,
    [doctorId],
  );

  const row = rows[0] || {};
  return {
    totalPatients: Number(row.total_patients || 0),
    loggedToday: Number(row.logged_today || 0),
    inRange: Number(row.in_range || 0),
    needsAttention: Number(row.needs_attention || 0),
  };
}

export async function listDoctorPatients(doctorId, search = '') {
  const params = [doctorId];
  let searchFilter = '';

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    searchFilter = `AND (LOWER(u.name) LIKE $2 OR LOWER(u.email) LIKE $2)`;
  }

  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       dp.created_at AS linked_at,
       EXISTS (
         SELECT 1
         FROM readings r
         WHERE r.user_id = u.id
           AND r.reading_date = CURRENT_DATE
       ) AS logged_today,
       (
         SELECT COUNT(*)::int
         FROM readings r
         WHERE r.user_id = u.id
           AND r.reading_date = CURRENT_DATE
       ) AS today_count,
       (
         SELECT ROUND(AVG(r.value)::numeric, 1)::float
         FROM readings r
         WHERE r.user_id = u.id
           AND r.reading_date >= CURRENT_DATE - INTERVAL '6 days'
           AND r.reading_date <= CURRENT_DATE
       ) AS seven_day_avg,
       (
         SELECT COUNT(*)::int
         FROM readings r
         WHERE r.user_id = u.id
           AND r.reading_date >= CURRENT_DATE - INTERVAL '6 days'
           AND r.reading_date <= CURRENT_DATE
       ) AS seven_day_count,
       lr.id AS last_reading_id,
       lr.value AS last_reading_value,
       lr.slot AS last_reading_slot,
       lr.reading_date AS last_reading_date
     FROM doctor_patients dp
     JOIN users u ON u.id = dp.patient_id
     LEFT JOIN LATERAL (
       SELECT r.id, r.value, r.slot, r.reading_date
       FROM readings r
       WHERE r.user_id = u.id
       ORDER BY r.reading_date DESC, r.created_at DESC
       LIMIT 1
     ) lr ON true
     WHERE dp.doctor_id = $1
       ${searchFilter}
     ORDER BY u.name ASC`,
    params,
  );

  return rows.map(mapPatientSummary);
}

export async function findUserWithLinkByEmail(email) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.created_at,
       dp.doctor_id,
       d.name AS doctor_name,
       d.email AS doctor_email
     FROM users u
     LEFT JOIN doctor_patients dp ON dp.patient_id = u.id
     LEFT JOIN users d ON d.id = dp.doctor_id
     WHERE LOWER(u.email) = LOWER($1)`,
    [email],
  );
  return rows[0] || null;
}

export async function findLinkedPatient(doctorId, patientId) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.created_at,
       dp.created_at AS linked_at,
       d.id AS doctor_id,
       d.name AS doctor_name,
       d.email AS doctor_email
     FROM doctor_patients dp
     JOIN users u ON u.id = dp.patient_id
     JOIN users d ON d.id = dp.doctor_id
     WHERE dp.doctor_id = $1
       AND dp.patient_id = $2`,
    [doctorId, patientId],
  );
  return rows[0] || null;
}

export async function linkPatient(doctorId, patientId) {
  await pool.query(
    `INSERT INTO doctor_patients (doctor_id, patient_id)
     VALUES ($1, $2)`,
    [doctorId, patientId],
  );

  const patients = await listDoctorPatients(doctorId);
  return patients.find((p) => p.id === patientId) || null;
}

