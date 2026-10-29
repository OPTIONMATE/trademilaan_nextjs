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
    const thisMonth = fromIST(y, m, s.dayOfMonth, hh, mm);
    return thisMonth <= now ? thisMonth : fromIST(y, m - 1, s.dayOfMonth, hh, mm);
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
  if (s.frequency === "monthly") return fromIST(y, m + 1, s.dayOfMonth, hh, mm);
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
  if (s.frequency === "monthly") return `Monthly on day ${s.dayOfMonth} at ${s.time} IST`;
  return `Every ${WEEKDAYS[s.dayOfWeek]} at ${s.time} IST`;
}

export { isoDateIST };
