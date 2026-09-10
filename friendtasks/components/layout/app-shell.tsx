"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { RealtimeRefresh } from "@/components/layout/realtime-refresh";
import type { Theme } from "@/lib/types/database";
import type { NotificationView } from "@/lib/data/notifications";

export function AppShell({
  displayName,
  theme,
  userId,
  initialNotifications,
  children,
}: {
  displayName: string;
  theme: Theme;
  userId: string;
  initialNotifications: NotificationView[];
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-1">
      <RealtimeRefresh />
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          displayName={displayName}
          theme={theme}
          userId={userId}
          initialNotifications={initialNotifications}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
