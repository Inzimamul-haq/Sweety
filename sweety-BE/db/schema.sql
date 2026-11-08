CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS readings (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  slot         TEXT NOT NULL,
  value        INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT readings_value_range CHECK (value BETWEEN 40 AND 600),
  CONSTRAINT readings_slot_allowed CHECK (
    slot IN ('Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner')
  ),
  CONSTRAINT readings_user_date_slot_unique UNIQUE (user_id, reading_date, slot)
);

CREATE INDEX IF NOT EXISTS readings_user_date_idx
  ON readings (user_id, reading_date);

DROP FUNCTION IF EXISTS reading_stats(integer, date, date);

CREATE OR REPLACE FUNCTION reading_stats(p_user_id uuid, p_from date, p_to date)
RETURNS TABLE(highest integer, lowest integer, average numeric, count integer)
LANGUAGE sql
STABLE
AS $$
  SELECT
    MAX(value)::int,
    MIN(value)::int,
    ROUND(AVG(value)::numeric, 1),
    COUNT(*)::int
  FROM readings
  WHERE user_id = p_user_id
    AND reading_date BETWEEN p_from AND p_to;
$$;