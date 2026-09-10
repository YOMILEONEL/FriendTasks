import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getProfile } from "@/lib/data/dal";
import { Nav } from "@/components/layout/nav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [profile, cookieStore] = await Promise.all([getProfile(), cookies()]);
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <div className="flex flex-1 flex-col">
      <Nav displayName={profile.display_name} theme={theme} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
