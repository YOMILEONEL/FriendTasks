// Server-local date helpers (YYYY-MM-DD strings, matching the `date` column
// type in Postgres). Timezone handling per-user is out of scope for Phase 1,
// but every "what day is it" helper below uses the server's local calendar
// date consistently — never toISOString(), which is UTC and can disagree
// with the browser's local <input type="date"> by a day around midnight.

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function endOfWeekISO(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const end = new Date(now);
  end.setDate(now.getDate() + daysUntilSunday);
  return toISODate(end);
}

export function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  return new Date(dueDate + "T00:00:00").toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Postgres `time` columns come back as "HH:MM:SS"; trim to "HH:MM" for display.
export function formatTime(dueTime: string | null): string | null {
  if (!dueTime) return null;
  return dueTime.slice(0, 5);
}

export function nowTimeISO(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Adds minutes to a "HH:MM" time, clamped to "23:59" instead of wrapping
// into the next day (good enough for a "due within the next hour" window).
export function addMinutesClamped(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  if (total >= 24 * 60) return "23:59";
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatTimeRange(start: string | null, end: string | null): string | null {
  const startLabel = formatTime(start);
  if (!startLabel) return null;
  const endLabel = formatTime(end);
  return endLabel ? `${startLabel}-${endLabel}` : startLabel;
}

export function formatDayLabel(dateISO: string): string {
  return new Date(dateISO + "T00:00:00").toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Parses a "YYYY-MM-DD" search param, falling back to today for a missing or
// malformed value rather than throwing on user-controlled input.
function parseISODate(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

export function startOfWeek(dateISO: string | undefined): string {
  const date = parseISODate(dateISO);
  const weekday = (date.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(date);
  monday.setDate(date.getDate() - weekday);
  return toISODate(monday);
}

export function shiftWeek(mondayISO: string, deltaWeeks: number): string {
  const date = parseISODate(mondayISO);
  date.setDate(date.getDate() + deltaWeeks * 7);
  return toISODate(date);
}

// The 7 ISO dates (Mon-Sun) of the week starting at `mondayISO`.
export function getWeekDays(mondayISO: string): string[] {
  const monday = parseISODate(mondayISO);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(toISODate(day));
  }
  return days;
}

export function formatWeekLabel(mondayISO: string): string {
  const days = getWeekDays(mondayISO);
  const start = new Date(days[0] + "T00:00:00");
  const end = new Date(days[6] + "T00:00:00");
  const startLabel = start.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  const endLabel = end.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

const WEEKDAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function formatDayColumnLabel(dateISO: string): string {
  const date = new Date(dateISO + "T00:00:00");
  const weekday = WEEKDAY_SHORT[(date.getDay() + 6) % 7];
  return `${weekday} ${date.getDate()}`;
}
