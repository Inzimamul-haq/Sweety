import bcrypt from 'bcrypt';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { SLOTS } from '../src/shared/constants/slots.js';

const { Pool } = pg;
const here = path.dirname(fileURLToPath(import.meta.url));

// Load .env
dotenv.config({ path: path.resolve(here, '../.env') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\n Missing DIRECT_URL or DATABASE_URL in .env');
  console.error('Please configure your Neon connection string in sweety-BE/.env\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const DEMO_EMAIL = 'demo@sweety.app';
const DEMO_PASSWORD = 'Demo12345';

function daysInMonth(y, mo) {
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function buildSampleReadings() {
  const rows = [];
  const year = 2026;
  const currentMonth = 11;
  const previousMonth = 10;

  for (let day = 1; day <= daysInMonth(year, previousMonth); day += 1) {
    const date = `${year}-${pad(previousMonth)}-${pad(day)}`;
    const values = [98 + (day % 7), 132 + (day % 9), 141 + (day % 11), 118 + (day % 5)];
    SLOTS.forEach((slot, index) => {
      if (day % 6 === 0 && index === 3) return;
      rows.push({ date, slot, value: values[index] });
    });
  }

  for (let day = 1; day <= 7; day += 1) {
    const date = `${year}-${pad(currentMonth)}-${pad(day)}`;
    const values = [102, 128, 146, 121];
    const count = day === 3 ? 2 : 4;
    SLOTS.slice(0, count).forEach((slot, index) => {
      rows.push({ date, slot, value: values[index] + day });
    });
  }

  return rows;
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding demo data into Neon PostgreSQL...');
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // Upsert demo user safely
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
       RETURNING id`,
      ['Demo Patient', DEMO_EMAIL, passwordHash],
    );
    const userId = userRes.rows[0].id;

    // Delete existing demo readings to keep re-runs idempotent and clean
    await client.query('DELETE FROM readings WHERE user_id = $1', [userId]);

    const sampleReadings = buildSampleReadings();

    // Insert sample readings safely
    for (const reading of sampleReadings) {
      await client.query(
        `INSERT INTO readings (user_id, reading_date, slot, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, slot)
         DO UPDATE SET value = EXCLUDED.value`,
        [userId, reading.date, reading.slot, reading.value],
      );
    }

    await client.query('COMMIT');

    console.log(
      ` Seeded demo user ${DEMO_EMAIL} / ${DEMO_PASSWORD} with ${sampleReadings.length} readings.`,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Database seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

await seed();
