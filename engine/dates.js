// Calendar helpers on ISO date strings ("YYYY-MM-DD"), done in UTC so that
// time zones and daylight saving can never shift a date by one day.

const DAY_MS = 86_400_000;

export function parseISO(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof s === 'string' ? s : '');
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const t = Date.UTC(y, mo - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return t;
}

export function toISO(t) {
  const d = new Date(t);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(d.getUTCFullYear(), 4)}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** Whole days from a to b (b - a). Negative if b is before a. */
export function diffDays(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / DAY_MS);
}

export function addDays(iso, n) {
  return toISO(parseISO(iso) + n * DAY_MS);
}

function daysInMonth(y, m0) {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

/** Add whole months; if the day does not exist in the target month, clamp to its last day. */
export function addMonths(iso, n) {
  const d = new Date(parseISO(iso));
  const total = d.getUTCFullYear() * 12 + d.getUTCMonth() + n;
  const y = Math.floor(total / 12);
  const m0 = ((total % 12) + 12) % 12;
  const day = Math.min(d.getUTCDate(), daysInMonth(y, m0));
  return toISO(Date.UTC(y, m0, day));
}

/** Months (possibly fractional) after a start date. A leftover fraction is rounded UP to whole days. */
export function addMonthsFractional(iso, months) {
  const whole = Math.floor(months + 1e-9);
  const frac = months - whole;
  const base = addMonths(iso, whole);
  return frac > 1e-9 ? addDays(base, Math.ceil(frac * 30)) : base;
}

/** Calendar difference between two dates as whole months plus leftover days. */
export function calendarDiff(a, b) {
  const A = new Date(parseISO(a)), B = new Date(parseISO(b));
  let months = (B.getUTCFullYear() - A.getUTCFullYear()) * 12 + (B.getUTCMonth() - A.getUTCMonth());
  if (addMonths(a, months) > b) months -= 1;
  return { months, days: diffDays(addMonths(a, months), b) };
}

export function weekdayIndex(iso) {
  return new Date(parseISO(iso)).getUTCDay(); // 0 = Sunday
}

/** Today's date in the user's own calendar, as ISO. */
export function todayISO(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
