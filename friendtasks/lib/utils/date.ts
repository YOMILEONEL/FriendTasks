// Server-local date helpers (YYYY-MM-DD strings, matching the `date` column
// type in Postgres). Timezone handling per-user is out of scope for Phase 1.

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function endOfWeekISO(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const end = new Date(now);
  end.setDate(now.getDate() + daysUntilSunday);
  return end.toISOString().slice(0, 10);
}

export function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  return new Date(dueDate + "T00:00:00").toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
