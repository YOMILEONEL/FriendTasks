import type { ActivityEntry } from "@/lib/data/activity";
import type { ActivityAction } from "@/lib/types/database";

const ACTION_LABEL: Record<ActivityAction, (entry: ActivityEntry) => string> = {
  todo_created: (e) => `hat „${e.detail}" erstellt`,
  todo_completed: (e) => `hat „${e.detail}" erledigt`,
  todo_deleted: (e) => `hat „${e.detail}" gelöscht`,
  member_joined: () => "ist der Gruppe beigetreten",
  member_left: () => "hat die Gruppe verlassen",
  list_created: (e) => `hat die Liste „${e.detail}" erstellt`,
  list_deleted: (e) => `hat die Liste „${e.detail}" gelöscht`,
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Noch keine Aktivität.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {entries.map((entry) => (
        <li key={entry.id} className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{entry.actor_name}</span>{" "}
          {ACTION_LABEL[entry.action](entry)}{" "}
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatTimestamp(entry.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
