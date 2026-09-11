"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionaryFor, type DictionaryKey } from "@/lib/i18n/dictionaries";

interface LocaleContextValue {
  locale: Locale;
  t: (key: DictionaryKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// The server resolves the locale cookie once (see lib/i18n/server.ts) and
// passes it in here — Client Components can't read cookies() themselves, so
// this context is how they get the same locale without each one re-deriving
// it or needing it prop-drilled individually.
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleContextValue>(() => {
    const dict = getDictionaryFor(locale);
    return { locale, t: (key: DictionaryKey) => dict[key] };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT must be used within a LocaleProvider");
  return ctx.t;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx.locale;
}
