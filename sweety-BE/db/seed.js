import bcrypt from 'bcrypt';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { SLOTS } from '../src/shared/constants/slots.js';

const { Pool } = pg;
const here = path.dirname(fileURLToPath(import.meta.url));

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

const DEFAULT_PASSWORD = 'Demo12345';

function formatUTCDate(dateObj) {
  return dateObj.toISOString().slice(0, 10);
}

function buildReadingsForProfile(baseValues, daysBack = 60, includeToday = true) {
  const rows = [];
  const today = new Date();
  const startOffset = includeToday ? 0 : 1;

  for (let offset = daysBack; offset >= startOffset; offset -= 1) {
    const dt = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset));
    const date = formatUTCDate(dt);
    const daySeed = dt.getUTCDate();
    const variance = (daySeed % 5) - 2;

    SLOTS.forEach((slot, index) => {
      // Occasionally skip a slot on older days for realism
      if (offset > 3 && (daySeed * (index + 1)) % 13 === 0) return;
      const rawValue = baseValues[index] + ((daySeed + index * 3) % 9) + variance;
      const value = Math.min(600, Math.max(40, Math.round(rawValue)));
      rows.push({ date, slot, value });
    });
  }

  return rows;
}

async function upsertUser(client, { name, email, passwordHash, role }) {
  const res = await client.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, LOWER($2), $3, $4)
     ON CONFLICT ((LOWER(email)))
     DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
     RETURNING id, name, email, role`,
    [name, email, passwordHash, role],
  );
  return res.rows[0];
}

async function seedReadingsForUser(client, userId, readings) {
  await client.query('DELETE FROM readings WHERE user_id = $1', [userId]);

  for (const reading of readings) {
    await client.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, reading_date, slot)
       DO UPDATE SET value = EXCLUDED.value`,
      [userId, reading.date, reading.slot, reading.value],
    );
  }
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding demo data into PostgreSQL...');
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // 1. Seed 1 Doctor
    const doctor = await upsertUser(client, {
      name: 'Dr. Ananya Sharma',
      email: 'doctor@sweety.app',
      passwordHash,
      role: 'doctor',
    });

    // 2. Seed 3 Linked Patients
    const patientDemo = await upsertUser(client, {
      name: 'Demo Patient',
      email: 'demo@sweety.app',
      passwordHash,
      role: 'patient',
    });

    const patientArjun = await upsertUser(client, {
      name: 'Arjun Mehta',
      email: 'arjun@sweety.app',
      passwordHash,
      role: 'patient',
    });

    const patientPriya = await upsertUser(client, {
      name: 'Priya Nair',
      email: 'priya@sweety.app',
      passwordHash,
      role: 'patient',
    });

    // 3. Seed 1 Unlinked Patient (for testing add-by-email)
    const patientRohan = await upsertUser(client, {
      name: 'Rohan Verma',
      email: 'rohan@sweety.app',
      passwordHash,
      role: 'patient',
    });

    // Seed readings for each patient
    await seedReadingsForUser(
      client,
      patientDemo.id,
      buildReadingsForProfile([95, 126, 134, 116], 75, true),
    );
    await seedReadingsForUser(
      client,
      patientArjun.id,
      buildReadingsForProfile([182, 215, 228, 196], 45, true),
    );
    await seedReadingsForUser(
      client,
      patientPriya.id,
      buildReadingsForProfile([58, 66, 68, 62], 45, false),
    );
    await seedReadingsForUser(
      client,
      patientRohan.id,
      buildReadingsForProfile([98, 130, 140, 122], 30, true),
    );

    // Link the 3 patients to the doctor (leave Rohan unlinked)
    await client.query('DELETE FROM doctor_patients WHERE doctor_id = $1', [doctor.id]);
    await client.query('DELETE FROM doctor_patients WHERE patient_id = $1', [patientRohan.id]);

    for (const linkedPatient of [patientDemo, patientArjun, patientPriya]) {
      await client.query(
        `INSERT INTO doctor_patients (doctor_id, patient_id)
         VALUES ($1, $2)
         ON CONFLICT (patient_id) DO UPDATE SET doctor_id = EXCLUDED.doctor_id`,
        [doctor.id, linkedPatient.id],
      );
    }

    await client.query('COMMIT');

    console.log('\nSeed complete!');
    console.log(`  Doctor:           doctor@sweety.app / ${DEFAULT_PASSWORD}`);
    console.log(`  Linked Patients:  demo@sweety.app, arjun@sweety.app, priya@sweety.app / ${DEFAULT_PASSWORD}`);
    console.log(`  Unlinked Patient: rohan@sweety.app / ${DEFAULT_PASSWORD}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

await seed();
