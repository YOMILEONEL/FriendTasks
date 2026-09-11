"use client";

import { format } from "@/lib/i18n/format";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import type { ActivityEntry } from "@/lib/data/activity";
import type { ActivityAction } from "@/lib/types/database";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

const ACTION_KEY: Record<ActivityAction, DictionaryKey> = {
  todo_created: "activity.todoCreated",
  todo_completed: "activity.todoCompleted",
  todo_deleted: "activity.todoDeleted",
  member_joined: "activity.memberJoined",
  member_left: "activity.memberLeft",
  list_created: "activity.listCreated",
  list_deleted: "activity.listDeleted",
};

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  const t = useT();
  const locale = useLocale();

  function formatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("activity.empty")}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {entries.map((entry) => (
        <li key={entry.id} className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{entry.actor_name}</span>{" "}
          {format(t(ACTION_KEY[entry.action]), { detail: entry.detail ?? "" })}{" "}
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatTimestamp(entry.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
