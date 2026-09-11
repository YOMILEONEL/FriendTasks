import Link from "next/link";
import { getWeekTodos } from "@/lib/data/todos";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { WeekGrid } from "@/components/calendar/week-grid";
import { formatWeekLabel, getWeekDays, shiftWeek, startOfWeek, todayISO } from "@/lib/utils/date";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const mondayISO = startOfWeek(params.week ?? todayISO());
  const previousWeek = shiftWeek(mondayISO, -1);
  const nextWeek = shiftWeek(mondayISO, 1);

  const [todos, t, locale] = await Promise.all([getWeekTodos(mondayISO), getDictionary(), getLocale()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{formatWeekLabel(mondayISO, locale)}</h1>
        <div className="flex gap-2">
          <Link
            href={`/calendar?week=${previousWeek}`}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {t["calendar.prevWeek"]}
          </Link>
          <Link
            href={`/calendar?week=${nextWeek}`}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {t["calendar.nextWeek"]}
          </Link>
        </div>
      </div>

      <WeekGrid weekDays={getWeekDays(mondayISO)} todos={todos} />
    </div>
  );
}
