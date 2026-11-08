import { pool } from '../../config/db.js';

export async function createUser({ name, email, passwordHash, role = 'patient' }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, LOWER($2), $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, passwordHash, role],
  );
  return rows[0];
}

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.password_hash,
       u.created_at,
       u.updated_at,
       d.id AS doctor_id,
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

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.created_at,
       u.updated_at,
       d.id AS doctor_id,
       d.name AS doctor_name,
       d.email AS doctor_email
     FROM users u
     LEFT JOIN doctor_patients dp ON dp.patient_id = u.id
     LEFT JOIN users d ON d.id = dp.doctor_id
     WHERE u.id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function findByIdWithPassword(id) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.password_hash,
       u.created_at,
       u.updated_at,
       d.id AS doctor_id,
       d.name AS doctor_name,
       d.email AS doctor_email
     FROM users u
     LEFT JOIN doctor_patients dp ON dp.patient_id = u.id
     LEFT JOIN users d ON d.id = dp.doctor_id
     WHERE u.id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function updateName({ id, name }) {
  await pool.query(
    `UPDATE users
     SET name = $1, updated_at = NOW()
     WHERE id = $2`,
    [name, id],
  );
  return findById(id);
}

export async function updatePassword({ id, passwordHash }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET password_hash = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [passwordHash, id],
  );
  return rows[0] || null;
}

export async function deleteUser(id) {
  const { rows } = await pool.query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id`,
    [id],
  );
  return rows[0] || null;
}
