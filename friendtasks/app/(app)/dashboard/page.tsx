import { getProfile } from "@/lib/data/dal";
import {
  getAllTodos,
  getInboxTodos,
  getTodayTodos,
  getUpcomingTodos,
  getUserTags,
} from "@/lib/data/todos";
import { OptionCard } from "@/components/dashboard/option-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodoList } from "@/components/todo/todo-list";
import { InboxIcon, ListIcon, TodayIcon, UpcomingIcon } from "@/components/layout/icons";

export default async function DashboardPage() {
  const [profile, todayTodos, upcomingTodos, inboxTodos, allOpenTodos, tags] = await Promise.all([
    getProfile(),
    getTodayTodos(),
    getUpcomingTodos(),
    getInboxTodos(),
    getAllTodos({ status: "open" }),
    getUserTags(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Hallo, {profile.display_name}</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard href="/today" label="Heute offen" value={todayTodos.length} icon={TodayIcon} />
        <StatCard
          href="/upcoming"
          label="Diese Woche offen"
          value={upcomingTodos.length}
          icon={UpcomingIcon}
        />
        <StatCard href="/inbox" label="Ohne Datum" value={inboxTodos.length} icon={InboxIcon} />
        <StatCard href="/all" label="Insgesamt offen" value={allOpenTodos.length} icon={ListIcon} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <OptionCard href="/calendar" title="Kalender" description="Todos nach Datum, direkt eintragen." />
        <OptionCard href="/groups" title="Gruppen" description="Geteilte Listen mit Freunden." />
        <OptionCard href="/settings" title="Einstellungen" description="Profil, Tags, Konto." />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Heute</h2>
        <TodoList todos={todayTodos} allTags={tags} emptyMessage="Für heute steht nichts an." />
      </div>
    </div>
  );
}
