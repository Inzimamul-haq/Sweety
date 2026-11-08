const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function parseISODate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;

  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));

  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }

  return { y, mo, d };
}

export function formatISO({ y, mo, d }) {
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function lastDayOfMonth(y, mo) {
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

export function utcTodayPlusOneISO() {
  const now = new Date();
  const plusOne = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return plusOne.toISOString().slice(0, 10);
}

export function isFutureDate(iso) {
  return iso > utcTodayPlusOneISO();
}

export function dailyRange(date) {
  return { from: date, to: date };
}

export function weekRange(date) {
  const parsed = parseISODate(date);
  const dt = new Date(Date.UTC(parsed.y, parsed.mo - 1, parsed.d));
  dt.setUTCDate(dt.getUTCDate() - 6);
  const from = formatISO({
    y: dt.getUTCFullYear(),
    mo: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  });
  return { from, to: date };
}

export function monthToDateRange(date) {
  const parsed = parseISODate(date);
  return { from: formatISO({ y: parsed.y, mo: parsed.mo, d: 1 }), to: date };
}

export function previousMonthRange(date) {
  const parsed = parseISODate(date);
  let y = parsed.y;
  let mo = parsed.mo - 1;

  if (mo === 0) {
    mo = 12;
    y -= 1;
  }

  return {
    from: formatISO({ y, mo, d: 1 }),
    to: formatISO({ y, mo, d: lastDayOfMonth(y, mo) }),
  };
}

function formatDay(iso, withYear) {
  const parsed = parseISODate(iso);
  const label = `${parsed.d} ${MONTHS[parsed.mo - 1]}`;
  return withYear ? `${label} ${parsed.y}` : label;
}

export function formatRangeLabel(from, to) {
  if (from === to) return formatDay(from, true);

  const start = parseISODate(from);
  const end = parseISODate(to);

  if (start.y === end.y) {
    return `${formatDay(from, false)} – ${formatDay(to, true)}`;
  }

  return `${formatDay(from, true)} – ${formatDay(to, true)}`;
}

export function rangeFor(kind, date) {
  if (kind === 'daily') return dailyRange(date);
  if (kind === 'weekly') return weekRange(date);
  if (kind === 'month-to-date') return monthToDateRange(date);
  if (kind === 'monthly') return previousMonthRange(date);
  throw new Error(`Unknown range kind: ${kind}`);
}
