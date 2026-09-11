"use client";

import { useTransition } from "react";
import { logout } from "@/lib/actions/auth";
import { useT } from "@/components/i18n/locale-provider";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const t = useT();

  function handleClick() {
    if (!confirm(t("topbar.logoutConfirm"))) return;
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
      {isPending ? t("topbar.loggingOut") : t("topbar.logout")}
    </button>
  );
}
