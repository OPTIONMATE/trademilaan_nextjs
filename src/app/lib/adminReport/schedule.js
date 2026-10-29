// Pure scheduling helpers for the admin report. Everything is IST
// (UTC+05:30, no DST), independent of the server's own timezone.

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// An automatic run only sends if it happens within this window after the
// scheduled time. Covers the daily Vercel fallback cron, while enabling the
// report (or changing the schedule) never fires an old, long-past occurrence.
export const SEND_GRACE_MS = 26 * 60 * 60 * 1000;

export const DEFAULT_SETTINGS = {
  enabled: true,
  frequency: "weekly",
  dayOfWeek: 1,
  dayOfMonth: 1,
  time: "09:00",
};

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// IST wall-clock parts of a real instant.
function istParts(date) {
  const d = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth(),
    d: d.getUTCDate(),
    dow: d.getUTCDay(),
  };
}

// Real instant for an IST wall-clock time (day/month overflow is normalised).
function fromIST(y, m, d, hh = 0, mm = 0) {
  return new Date(Date.UTC(y, m, d, hh, mm) - IST_OFFSET_MS);
}

// Scheduled day in a month: days past the month's end (e.g. 31 in April)
// fall back to its last day.
function monthDay(y, m, dayOfMonth) {
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Math.min(dayOfMonth, lastDay);
}

function parseTime(time) {
  const [hh, mm] = String(time || DEFAULT_SETTINGS.time).split(":").map(Number);
  return [Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0];
}

// Most recent scheduled send time at or before `now`.
export function getLatestOccurrence(settings, now = new Date()) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const [hh, mm] = parseTime(s.time);
  const { y, m, d, dow } = istParts(now);

  if (s.frequency === "daily") {
    const today = fromIST(y, m, d, hh, mm);
    return today <= now ? today : fromIST(y, m, d - 1, hh, mm);
  }
  if (s.frequency === "monthly") {
    const thisMonth = fromIST(y, m, monthDay(y, m, s.dayOfMonth), hh, mm);
    return thisMonth <= now ? thisMonth : fromIST(y, m - 1, monthDay(y, m - 1, s.dayOfMonth), hh, mm);
  }
  // weekly
  const back = (dow - s.dayOfWeek + 7) % 7;
  const candidate = fromIST(y, m, d - back, hh, mm);
  return candidate <= now ? candidate : fromIST(y, m, d - back - 7, hh, mm);
}

// Next scheduled send time strictly after `now`.
export function getNextOccurrence(settings, now = new Date()) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const latest = getLatestOccurrence(s, now);
  const [hh, mm] = parseTime(s.time);
  const { y, m, d } = istParts(new Date(latest.getTime()));
  if (s.frequency === "daily") return fromIST(y, m, d + 1, hh, mm);
  if (s.frequency === "monthly") return fromIST(y, m + 1, monthDay(y, m + 1, s.dayOfMonth), hh, mm);
  return fromIST(y, m, d + 7, hh, mm);
}

function isoDateIST(date) {
  const { y, m, d } = istParts(date);
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Completed period an automatic report (sent at `occurrence`) covers:
// daily = previous day, weekly = previous 7 days, monthly = previous calendar
// month. `end` is exclusive (IST midnight).
export function getScheduledPeriod(settings, occurrence) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const { y, m, d } = istParts(occurrence);
  let start;
  let end;
  if (s.frequency === "monthly") {
    end = fromIST(y, m, 1);
    start = fromIST(y, m - 1, 1);
  } else {
    end = fromIST(y, m, d);
    start = fromIST(y, m, d - (s.frequency === "daily" ? 1 : 7));
  }
  return {
    frequency: s.frequency,
    start,
    end,
    periodKey: `${s.frequency}:${isoDateIST(occurrence)}`,
  };
}

// Rolling period ending now, for manual / test sends and dashboard downloads.
export function getRollingPeriod(settings, now = new Date()) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  let start;
  if (s.frequency === "monthly") {
    const { y, m, d } = istParts(now);
    start = fromIST(y, m - 1, d);
  } else {
    start = new Date(now.getTime() - (s.frequency === "daily" ? 1 : 7) * DAY_MS);
  }
  return {
    frequency: s.frequency,
    start,
    end: now,
    periodKey: `manual:${now.toISOString()}`,
  };
}

const MAX_CUSTOM_DAYS = 366;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;

function parseISTDate(value) {
  const match = DATE_RE.exec(String(value || ""));
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = fromIST(y, m, d);
  const parts = istParts(date);
  return parts.y === y && parts.m === m && parts.d === d ? { y, m, d } : null;
}

// Admin-chosen period for on-demand downloads (IST):
// day = that date, week = 7 days from that date, month = that calendar month,
// last6 = this month and the 5 before it, custom = from..to inclusive.
// Returns null for invalid input; the end is capped at `now`.
export function getCustomPeriod({ range, date, month, from, to }, now = new Date()) {
  let start;
  let end;
  let frequency = "monthly";
  if (range === "day" || range === "week") {
    const p = parseISTDate(date);
    if (!p) return null;
    start = fromIST(p.y, p.m, p.d);
    end = fromIST(p.y, p.m, p.d + (range === "day" ? 1 : 7));
    frequency = range === "day" ? "daily" : "weekly";
  } else if (range === "month") {
    const match = MONTH_RE.exec(String(month || ""));
    const m = match ? Number(match[2]) - 1 : -1;
    if (m < 0 || m > 11) return null;
    start = fromIST(Number(match[1]), m, 1);
    end = fromIST(Number(match[1]), m + 1, 1);
  } else if (range === "last6") {
    const { y, m } = istParts(now);
    start = fromIST(y, m - 5, 1);
    end = now;
  } else if (range === "custom") {
    const a = parseISTDate(from);
    const b = parseISTDate(to);
    if (!a || !b) return null;
    start = fromIST(a.y, a.m, a.d);
    end = fromIST(b.y, b.m, b.d + 1);
  } else {
    return null;
  }

  if (end > now) end = now;
  if (start >= end || end.getTime() - start.getTime() > MAX_CUSTOM_DAYS * DAY_MS) return null;
  return { frequency, start, end, custom: true };
}

// Equal-length window right before the period, for "vs previous" figures.
export function getPreviousPeriod({ start, end }) {
  const length = end.getTime() - start.getTime();
  return { start: new Date(start.getTime() - length), end: start };
}

export function formatISTDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatISTDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Human label, end shown inclusive: "26 Oct 2026 – 01 Nov 2026".
export function formatPeriodLabel({ start, end }) {
  const lastIncluded = new Date(end.getTime() - 1);
  return `${formatISTDate(start)} – ${formatISTDate(lastIncluded)}`;
}

export function describeSchedule(settings) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  if (s.frequency === "daily") return `Every day at ${s.time} IST`;
  if (s.frequency === "monthly") {
    const lastDayNote = s.dayOfMonth > 28 ? " (or the month's last day)" : "";
    return `Monthly on day ${s.dayOfMonth}${lastDayNote} at ${s.time} IST`;
  }
  return `Every ${WEEKDAYS[s.dayOfWeek]} at ${s.time} IST`;
}

export { isoDateIST };
