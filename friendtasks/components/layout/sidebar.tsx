"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  FolderIcon,
  GroupsIcon,
  InboxIcon,
  ListIcon,
  SettingsIcon,
  TodayIcon,
  UpcomingIcon,
} from "@/components/layout/icons";
import { LogoMark } from "@/components/layout/logo";
import { useT } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

const LINKS: { href: string; labelKey: DictionaryKey; icon: ComponentType<{ className?: string }> }[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: DashboardIcon },
  { href: "/today", labelKey: "nav.today", icon: TodayIcon },
  { href: "/upcoming", labelKey: "nav.upcoming", icon: UpcomingIcon },
  { href: "/inbox", labelKey: "nav.inbox", icon: InboxIcon },
  { href: "/all", labelKey: "nav.all", icon: ListIcon },
  { href: "/calendar", labelKey: "nav.calendar", icon: CalendarIcon },
  { href: "/groups", labelKey: "nav.groups", icon: GroupsIcon },
  { href: "/lists", labelKey: "nav.lists", icon: FolderIcon },
  { href: "/settings", labelKey: "nav.settings", icon: SettingsIcon },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Logo({ collapsed }: { collapsed: boolean }) {
  const t = useT();
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-5">
      <LogoMark />
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t("nav.appName")}
          </span>
          <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{t("nav.tagline")}</span>
        </span>
      )}
    </Link>
  );
}

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-2">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        const label = t(link.labelKey);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const t = useT();

  return (
    <>
      {/* Desktop: permanent sidebar, collapsible to icon-only */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] md:flex dark:border-zinc-800 dark:bg-zinc-950 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <Logo collapsed={collapsed} />
        <NavLinks collapsed={collapsed} />
        <div className="p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile: off-canvas drawer, opened via the hamburger button in TopBar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 flex h-full w-64 max-w-[80vw] flex-col bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <Logo collapsed={false} />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label={t("nav.closeMenu")}
                className="mr-3 text-xl leading-none text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ×
              </button>
            </div>
            <NavLinks collapsed={false} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
