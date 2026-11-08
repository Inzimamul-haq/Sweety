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
