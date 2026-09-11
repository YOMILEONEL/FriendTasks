"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead, markNotificationsRead } from "@/lib/actions/notifications";
import { createClient } from "@/lib/supabase/client";
import { BellIcon } from "@/components/layout/icons";
import { useT } from "@/components/i18n/locale-provider";
import { format } from "@/lib/i18n/format";
import type { NotificationView } from "@/lib/data/notifications";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

interface Bundle {
  key: string;
  type: "assigned" | "comment";
  count: number;
  actorNames: string[];
  latest: NotificationView;
  unreadIds: string[];
  hasUnread: boolean;
}

// Collapses repeated notifications about the same todo into one line (FR-34),
// e.g. 3 separate "comment" rows for the same todo become one "3 neue
// Kommentare" entry instead of 3 separate alerts.
function bundle(notifications: NotificationView[]): Bundle[] {
  const map = new Map<string, Bundle>();
  for (const n of notifications) {
    const key = `${n.type}:${n.todo_id ?? n.id}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.actorNames.includes(n.actor_name)) existing.actorNames.push(n.actor_name);
      if (!n.is_read) {
        existing.hasUnread = true;
        existing.unreadIds.push(n.id);
      }
      if (n.created_at > existing.latest.created_at) existing.latest = n;
    } else {
      map.set(key, {
        key,
        type: n.type,
        count: 1,
        actorNames: [n.actor_name],
        latest: n,
        unreadIds: n.is_read ? [] : [n.id],
        hasUnread: !n.is_read,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => (a.latest.created_at < b.latest.created_at ? 1 : -1));
}

function bundleLabel(b: Bundle, t: (key: DictionaryKey) => string): string {
  if (b.type === "assigned") {
    return b.count === 1
      ? format(t("notifications.assignedOne"), {
          actor: b.actorNames[0],
          title: b.latest.message ?? t("notifications.aTodo"),
        })
      : format(t("notifications.assignedMany"), { count: b.count });
  }
  return b.count === 1
    ? format(t("notifications.commentOne"), { actor: b.actorNames[0], message: b.latest.message ?? "" })
    : format(t("notifications.commentMany"), { count: b.count });
}

function bundleHref(b: Bundle): string {
  if (b.latest.group_id) return `/groups/${b.latest.group_id}`;
  if (b.latest.list_id) return `/lists/${b.latest.list_id}`;
  return "/all";
}

export function NotificationBell({
  initialNotifications,
  userId,
}: {
  initialNotifications: NotificationView[];
  userId: string;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationView, ...prev].slice(0, 30));
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  const bundles = useMemo(() => bundle(notifications), [notifications]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleOpenBundle(b: Bundle) {
    setOpen(false);
    if (b.unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => (b.unreadIds.includes(n.id) ? { ...n, is_read: true } : n)));
    markNotificationsRead(b.unreadIds);
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    markAllNotificationsRead();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("topbar.notifications")}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("topbar.notifications")}</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  {t("topbar.markAllRead")}
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {bundles.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {t("topbar.noNotifications")}
                </li>
              ) : (
                bundles.map((b) => (
                  <li key={b.key} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/50">
                    <Link
                      href={bundleHref(b)}
                      onClick={() => handleOpenBundle(b)}
                      className={`block px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                        b.hasUnread ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {bundleLabel(b, t)}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
