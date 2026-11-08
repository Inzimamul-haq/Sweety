import { pool } from '../../config/db.js';

export async function createUser({ name, email, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash],
  );
  return rows[0];
}

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email],
  );
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function findByIdWithPassword(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function updateName({ id, name }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET name = $1
     WHERE id = $2
     RETURNING id, name, email, created_at`,
    [name, id],
  );
  return rows[0] || null;
}

export async function updatePassword({ id, passwordHash }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET password_hash = $1
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
