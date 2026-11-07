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

export function todayInTimezone(timezone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function isFutureDate(iso, timezone) {
  return iso > todayInTimezone(timezone);
}

export function dailyRange(date) {
  return { from: date, to: date };
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
  if (kind === 'month-to-date') return monthToDateRange(date);
  if (kind === 'monthly') return previousMonthRange(date);
  throw new Error(`Unknown range kind: ${kind}`);
}
