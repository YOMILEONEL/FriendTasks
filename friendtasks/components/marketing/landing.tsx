import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/layout/logo";
import type { Theme } from "@/lib/types/database";

const AUDIENCES = [
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
];

const FEATURES = [
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
    title: "Gruppen (bald)",
    description: "Geteilte Listen mit Zuweisungen für Freundeskreis, WG oder Team.",
  },
];

export function Landing({ theme }: { theme: Theme }) {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
            <LogoMark />
            FriendTasks
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} />
            <Link
              href="/login"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Anmelden
            </Link>
            <Link href="/signup">
              <Button className="px-4 py-1.5 text-sm">Registrieren</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Todos für dich und deinen Freundeskreis
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Persönliche Aufgaben und geteilte Listen in einer schnellen App. Für den WG-Putzplan
            genauso wie für dein nächstes Feature: Todos mit Fälligkeitsdatum, Priorität,
            Unteraufgaben und Tags.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup">
              <Button className="px-5 py-2.5">Registrieren</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="px-5 py-2.5">
                Anmelden
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Für wen
            </h2>
            <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
              {AUDIENCES.map((audience) => (
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
              Funktionen
            </h2>
            <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
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
            Leg direkt los
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Konto erstellen und in wenigen Minuten die erste Liste anlegen.
          </p>
          <div className="mt-6">
            <Link href="/signup">
              <Button className="px-5 py-2.5">Konto erstellen</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        FriendTasks ·{" "}
        <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Anmelden
        </Link>
      </footer>
    </div>
  );
}
