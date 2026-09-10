import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getProfile } from "@/lib/data/dal";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [profile, cookieStore] = await Promise.all([getProfile(), cookies()]);
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <AppShell displayName={profile.display_name} theme={theme}>
      {children}
    </AppShell>
  );
}
