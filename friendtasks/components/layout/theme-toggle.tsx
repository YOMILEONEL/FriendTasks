"use client";

import { useTransition } from "react";
import { setTheme } from "@/lib/actions/profile";
import type { Theme } from "@/lib/types/database";

export function ThemeToggle({ theme }: { theme: Theme }) {
  const [isPending, startTransition] = useTransition();

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
      aria-label="Dark Mode umschalten"
      className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
