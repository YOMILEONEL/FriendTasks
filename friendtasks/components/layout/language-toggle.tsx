"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/actions/profile";
import type { Locale } from "@/lib/i18n/config";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(() => {
      setLocale(locale === "de" ? "en" : "de");
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label="Switch language"
      title={locale === "de" ? "Switch to English" : "Auf Deutsch wechseln"}
      className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {locale === "de" ? "EN" : "DE"}
    </button>
  );
}
