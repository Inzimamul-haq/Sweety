DROP TABLE IF EXISTS doctor_patients CASCADE;
DROP TABLE IF EXISTS readings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP FUNCTION IF EXISTS reading_stats(integer, date, date);
DROP FUNCTION IF EXISTS reading_stats(uuid, date, date);
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

CREATE TYPE user_role AS ENUM ('patient', 'doctor');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'patient',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE readings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  slot         TEXT NOT NULL,
  value        INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT readings_value_range CHECK (value BETWEEN 40 AND 600),
  CONSTRAINT readings_slot_allowed CHECK (
    slot IN ('Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner')
  ),
  CONSTRAINT readings_user_date_slot_unique UNIQUE (user_id, reading_date, slot)
);

CREATE TRIGGER readings_set_updated_at
  BEFORE UPDATE ON readings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE doctor_patients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT doctor_patients_no_self CHECK (doctor_id <> patient_id),
  CONSTRAINT doctor_patients_unique_pair UNIQUE (doctor_id, patient_id),
  CONSTRAINT doctor_patients_single_doctor UNIQUE (patient_id)
);

CREATE INDEX doctor_patients_doctor_idx ON doctor_patients (doctor_id);
