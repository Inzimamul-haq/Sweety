import bcrypt from 'bcrypt';
import { supabase, throwIfError } from '../src/config/db.js';
import { SLOTS } from '../src/shared/constants/slots.js';

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
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const existing = await supabase
    .from('users')
    .select('id')
    .eq('email', DEMO_EMAIL)
    .maybeSingle();
  throwIfError(existing.error);

  let userId = existing.data?.id;

  if (userId) {
    const updated = await supabase
      .from('users')
      .update({ name: 'Demo Patient', password_hash: passwordHash })
      .eq('id', userId)
      .select('id')
      .single();
    throwIfError(updated.error);
  } else {
    const created = await supabase
      .from('users')
      .insert({
        name: 'Demo Patient',
        email: DEMO_EMAIL,
        password_hash: passwordHash,
      })
      .select('id')
      .single();
    throwIfError(created.error);
    userId = created.data.id;
  }

  const removed = await supabase.from('readings').delete().eq('user_id', userId);
  throwIfError(removed.error);

  const readings = buildSampleReadings().map((reading) => ({
    user_id: userId,
    reading_date: reading.date,
    slot: reading.slot,
    value: reading.value,
  }));

  const inserted = await supabase.from('readings').insert(readings);
  throwIfError(inserted.error);

  process.stdout.write(
    `Seeded demo user ${DEMO_EMAIL} / ${DEMO_PASSWORD} with ${readings.length} readings.\n`,
  );
}

await seed();
