"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/layout/logout-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import type { Theme } from "@/lib/types/database";
import type { NotificationView } from "@/lib/data/notifications";

export function TopBar({
  displayName,
  theme,
  userId,
  initialNotifications,
  onMenuClick,
}: {
  displayName: string;
  theme: Theme;
  userId: string;
  initialNotifications: NotificationView[];
  onMenuClick: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950/90">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Menü öffnen"
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>
      <div className="flex flex-1 items-center justify-end gap-3">
        <NotificationBell initialNotifications={initialNotifications} userId={userId} />
        <ThemeToggle theme={theme} />
        <Link
          href="/settings"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {displayName}
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
