import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getProfile, verifySession } from "@/lib/data/dal";
import { getNotifications } from "@/lib/data/notifications";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [profile, session, notifications, cookieStore] = await Promise.all([
    getProfile(),
    verifySession(),
    getNotifications(),
    cookies(),
  ]);
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <AppShell
      displayName={profile.display_name}
      theme={theme}
      userId={session.userId}
      initialNotifications={notifications}
    >
      {children}
    </AppShell>
  );
}
