import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { LogoMark } from "@/components/layout/logo";
import { getDictionaryFor } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { Theme } from "@/lib/types/database";

const CONTENT: Record<
  Locale,
  {
    heroTitle: string;
    heroSubtitle: string;
    forWhom: string;
    audiences: { number: string; title: string; description: string }[];
    features: string;
    featureList: { title: string; description: string }[];
    ctaTitle: string;
    ctaSubtitle: string;
  }
> = {
  de: {
    heroTitle: "Todos für dich und deinen Freundeskreis",
    heroSubtitle:
      "Persönliche Aufgaben und geteilte Listen in einer schnellen App. Für den WG-Putzplan genauso wie für dein nächstes Feature: Todos mit Fälligkeitsdatum, Priorität, Unteraufgaben und Tags.",
    forWhom: "Für wen",
    audiences: [
      {
        number: "01",
        title: "Freundeskreise & WGs",
        description:
          "Gemeinsame Listen für Haushaltsaufgaben, Einkäufe oder die nächste Party. Jeder sieht sofort, was zu tun ist.",
      },
      {
        number: "02",
        title: "Reisen & Events",
        description:
          "Packlisten, Buchungen und Todos für die nächste gemeinsame Reise an einem Ort statt verstreut in Chats.",
      },
      {
        number: "03",
        title: "Entwickler & Solo-Projekte",
        description:
          "Features in Unteraufgaben zerlegen, Bugs priorisieren, Todos nach Projekt taggen und Sprint für Sprint planen. Auch ohne Team.",
      },
    ],
    features: "Funktionen",
    featureList: [
      {
        title: "Persönliche Todos",
        description: "Titel, Beschreibung, Fälligkeitsdatum und Priorität an einem Ort.",
      },
      {
        title: "Subtasks & Checklisten",
        description: "Größere Aufgaben in einzeln abhakbare Schritte zerlegen.",
      },
      {
        title: "Tags & Filter",
        description: "Nach Projekt, Kontext oder Kategorie sortieren und filtern.",
      },
      {
        title: "Smart Lists",
        description: "Heute, diese Woche und ohne Datum, immer im richtigen Fokus.",
      },
      {
        title: "Dark Mode",
        description: "Manuell umschaltbar, für lange Arbeits- und Coding-Sessions.",
      },
      {
        title: "Gruppen & Listen",
        description: "Geteilte Listen mit Zuweisungen für Freundeskreis, WG oder Team.",
      },
    ],
    ctaTitle: "Leg direkt los",
    ctaSubtitle: "Konto erstellen und in wenigen Minuten die erste Liste anlegen.",
  },
  en: {
    heroTitle: "Todos for you and your friends",
    heroSubtitle:
      "Personal tasks and shared lists in one fast app. Just as good for the roommate cleaning schedule as for your next feature: todos with due dates, priority, subtasks and tags.",
    forWhom: "Who it's for",
    audiences: [
      {
        number: "01",
        title: "Friend groups & roommates",
        description:
          "Shared lists for chores, shopping, or the next party. Everyone sees at a glance what needs doing.",
      },
      {
        number: "02",
        title: "Trips & events",
        description:
          "Packing lists, bookings and todos for your next group trip in one place instead of scattered across chats.",
      },
      {
        number: "03",
        title: "Developers & solo projects",
        description:
          "Break features into subtasks, prioritize bugs, tag todos by project and plan sprint by sprint. Works solo too.",
      },
    ],
    features: "Features",
    featureList: [
      {
        title: "Personal todos",
        description: "Title, description, due date and priority in one place.",
      },
      {
        title: "Subtasks & checklists",
        description: "Break bigger tasks into individually checkable steps.",
      },
      {
        title: "Tags & filters",
        description: "Sort and filter by project, context or category.",
      },
      {
        title: "Smart lists",
        description: "Today, this week and no-date views, always the right focus.",
      },
      {
        title: "Dark mode",
        description: "Manually switchable, for long work and coding sessions.",
      },
      {
        title: "Groups & lists",
        description: "Shared lists with assignments for your friend group, roommates or team.",
      },
    ],
    ctaTitle: "Get started",
    ctaSubtitle: "Create an account and set up your first list in a few minutes.",
  },
};

export function Landing({ theme, locale }: { theme: Theme; locale: Locale }) {
  const t = getDictionaryFor(locale);
  const content = CONTENT[locale];

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
            <LogoMark />
            {t["nav.appName"]}
          </span>
          <div className="flex items-center gap-3">
            <LanguageToggle locale={locale} />
            <ThemeToggle theme={theme} />
            <Link
              href="/login"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {t["auth.login"]}
            </Link>
            <Link href="/signup">
              <Button className="px-4 py-1.5 text-sm">{t["auth.signup"]}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            {content.heroSubtitle}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup">
              <Button className="px-5 py-2.5">{t["auth.signup"]}</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="px-5 py-2.5">
                {t["auth.login"]}
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {content.forWhom}
            </h2>
            <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
              {content.audiences.map((audience) => (
                <div key={audience.title} className="bg-white p-6 dark:bg-zinc-950">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {audience.number}
                  </span>
                  <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">
                    {audience.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {audience.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {content.features}
            </h2>
            <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {content.featureList.map((feature) => (
                <div key={feature.title} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <dt className="font-medium text-zinc-900 dark:text-zinc-50">{feature.title}</dt>
                  <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-zinc-200 px-4 py-16 text-center dark:border-zinc-800">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {content.ctaTitle}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{content.ctaSubtitle}</p>
          <div className="mt-6">
            <Link href="/signup">
              <Button className="px-5 py-2.5">{t["auth.createAccount"]}</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {t["nav.appName"]} ·{" "}
        <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          {t["auth.login"]}
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          {t["footer.privacy"]}
        </Link>
      </footer>
    </div>
  );
}
