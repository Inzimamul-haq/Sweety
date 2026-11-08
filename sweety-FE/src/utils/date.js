export function todayISO() {
  const now = new Date();
  const tz = 'Asia/Kolkata';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function parseISODate(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3) return null;
  return { y: parts[0], mo: parts[1], d: parts[2] };
}

export function formatPretty(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
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
  return `${d} ${months[m - 1]} ${y}`;
}

export function glucoseTone(value) {
  if (value < 70) return 'low';
  if (value > 180) return 'high';
  return 'ok';
}
