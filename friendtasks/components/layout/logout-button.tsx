"use client";

import { useTransition } from "react";
import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Wirklich abmelden?")) return;
    startTransition(() => {
      logout();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      {isPending ? "Meldet ab…" : "Abmelden"}
    </button>
  );
}
