/** Local-calendar date helpers. Day keys are "YYYY-MM-DD" in the user's timezone. */

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseDay(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = parseDay(b).getTime() - parseDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Monday-based week key: the day key of that week's Monday. */
export function weekKey(key: string = dayKey()): string {
  const d = parseDay(key);
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow);
  return dayKey(d);
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatDay(key: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return parseDay(key).toLocaleDateString(undefined, opts);
}
