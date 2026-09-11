import { getProfile } from "@/lib/data/dal";
import {
  getAllTodos,
  getInboxTodos,
  getTodayTodos,
  getTodoAlerts,
  getUpcomingTodos,
  getUserTags,
} from "@/lib/data/todos";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/format";
import { OptionCard } from "@/components/dashboard/option-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodoAlertsBanner } from "@/components/dashboard/todo-alerts";
import { TodoList } from "@/components/todo/todo-list";
import { InboxIcon, ListIcon, TodayIcon, UpcomingIcon } from "@/components/layout/icons";

export default async function DashboardPage() {
  const [profile, alerts, todayTodos, upcomingTodos, inboxTodos, allOpenTodos, tags, t, locale] =
    await Promise.all([
      getProfile(),
      getTodoAlerts(),
      getTodayTodos(),
      getUpcomingTodos(),
      getInboxTodos(),
      getAllTodos({ status: "open" }),
      getUserTags(),
      getDictionary(),
      getLocale(),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">{format(t["dashboard.hello"], { name: profile.display_name })}</h1>

      <TodoAlertsBanner overdue={alerts.overdue} dueSoon={alerts.dueSoon} t={t} locale={locale} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard href="/today" label={t["dashboard.todayOpen"]} value={todayTodos.length} icon={TodayIcon} />
        <StatCard
          href="/upcoming"
          label={t["dashboard.weekOpen"]}
          value={upcomingTodos.length}
          icon={UpcomingIcon}
        />
        <StatCard href="/inbox" label={t["nav.inbox"]} value={inboxTodos.length} icon={InboxIcon} />
        <StatCard href="/all" label={t["dashboard.totalOpen"]} value={allOpenTodos.length} icon={ListIcon} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <OptionCard href="/calendar" title={t["nav.calendar"]} description={t["dashboard.calendarDesc"]} />
        <OptionCard href="/groups" title={t["nav.groups"]} description={t["dashboard.groupsDesc"]} />
        <OptionCard href="/settings" title={t["nav.settings"]} description={t["dashboard.settingsDesc"]} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["nav.today"]}</h2>
        <TodoList todos={todayTodos} allTags={tags} emptyMessage={t["page.today.empty"]} />
      </div>
    </div>
  );
}
