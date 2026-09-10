import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/layout/logout-button";
import type { Theme } from "@/lib/types/database";

const LINKS = [
  { href: "/today", label: "Heute" },
  { href: "/upcoming", label: "Diese Woche" },
  { href: "/inbox", label: "Ohne Datum" },
  { href: "/all", label: "Alle" },
];

export function Nav({ displayName, theme }: { displayName: string; theme: Theme }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4">
          <Link href="/today" className="font-semibold text-zinc-900 dark:text-zinc-50">
            FriendTasks
          </Link>
          <div className="hidden gap-3 text-sm text-zinc-600 dark:text-zinc-400 sm:flex">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-zinc-900 dark:hover:text-zinc-50">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-2">
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
      <div className="flex gap-3 border-t border-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:border-zinc-900 dark:text-zinc-400 sm:hidden">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-zinc-900 dark:hover:text-zinc-50">
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
