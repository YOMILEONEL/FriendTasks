"use client";

import { useTransition } from "react";
import { setTheme } from "@/lib/actions/profile";
import { useT } from "@/components/i18n/locale-provider";
import type { Theme } from "@/lib/types/database";

export function ThemeToggle({ theme }: { theme: Theme }) {
  const [isPending, startTransition] = useTransition();
  const t = useT();

  function toggle() {
    startTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={t("theme.toggle")}
      className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
