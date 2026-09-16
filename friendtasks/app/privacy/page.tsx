import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";

export const metadata = {
  title: "Datenschutz / Privacy · PlanyourTasks",
};

const CONTENT: Record<
  Locale,
  {
    title: string;
    intro: string;
    sections: { heading: string; body: string }[];
  }
> = {
  de: {
    title: "Datenschutzerklärung",
    intro:
      "PlanyourTasks ist ein privates, nicht-kommerzielles Hobbyprojekt für die eigene Nutzung im Freundeskreis.",
    sections: [
      {
        heading: "Welche Daten werden gespeichert?",
        body: "Bei der Registrierung werden deine E-Mail-Adresse und dein Passwort (verschlüsselt) gespeichert. Zusätzlich legst du einen Anzeigenamen, optional ein Profilbild und eine Wiedererkennungsfarbe fest. Darüber hinaus speichert die App die Inhalte, die du selbst anlegst: Todos, Unteraufgaben, Tags, Gruppen, Listen und deren Mitgliedschaften.",
      },
      {
        heading: "Wo werden die Daten gehostet?",
        body: "Die Datenspeicherung und Authentifizierung laufen über Supabase, das Hosting der Anwendung über Vercel. Beide Anbieter verarbeiten die Daten in unserem Auftrag; es erfolgt keine Weitergabe an weitere Dritte, kein Tracking und keine Werbung.",
      },
      {
        heading: "Cookies",
        body: "Es werden ausschließlich technisch notwendige Cookies gesetzt: eines für deine angemeldete Sitzung (Supabase Auth), eines für deine Hell-/Dunkelmodus-Einstellung und eines für deine Sprachwahl. Es gibt kein Analyse- oder Marketing-Tracking.",
      },
      {
        heading: "Sichtbarkeit deiner Daten",
        body: "Persönliche Todos sind nur für dich sichtbar. Todos in einer Gruppe oder einer geteilten Liste sind für die Mitglieder dieser Gruppe bzw. Liste sichtbar, technisch durchgesetzt über Zugriffsregeln direkt in der Datenbank (Row Level Security).",
      },
      {
        heading: "Deine Rechte",
        body: "Du kannst deinen Anzeigenamen und deine Farbe jederzeit in den Einstellungen ändern. Du kannst dein Konto samt aller zugehörigen Daten (Todos, Gruppen, Listen, Mitgliedschaften) jederzeit vollständig und unwiderruflich löschen, ebenfalls über die Einstellungen.",
      },
      {
        heading: "Kontakt",
        body: "Bei Fragen zum Datenschutz wende dich direkt an die Person, die dich zu PlanyourTasks eingeladen hat bzw. die diese Instanz betreibt.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    intro: "PlanyourTasks is a private, non-commercial hobby project for personal use among friends.",
    sections: [
      {
        heading: "What data is stored?",
        body: "When you sign up, your email address and password (encrypted) are stored. You also set a display name and, optionally, an avatar and a recognition color. Beyond that, the app stores the content you create yourself: todos, subtasks, tags, groups, lists and their memberships.",
      },
      {
        heading: "Where is the data hosted?",
        body: "Data storage and authentication run through Supabase, and the app itself is hosted on Vercel. Both providers process data on our behalf; there is no sharing with further third parties, no tracking and no advertising.",
      },
      {
        heading: "Cookies",
        body: "Only strictly necessary cookies are set: one for your signed-in session (Supabase Auth), one for your light/dark mode preference, and one for your language choice. There is no analytics or marketing tracking.",
      },
      {
        heading: "Visibility of your data",
        body: "Personal todos are only visible to you. Todos in a group or a shared list are visible to that group's or list's members, enforced at the database level via access rules (Row Level Security).",
      },
      {
        heading: "Your rights",
        body: "You can change your display name and color at any time in Settings. You can permanently and irreversibly delete your account, along with all associated data (todos, groups, lists, memberships), at any time, also from Settings.",
      },
      {
        heading: "Contact",
        body: "For privacy questions, please contact the person who invited you to PlanyourTasks or who operates this instance.",
      },
    ],
  },
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const content = CONTENT[locale];

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <LogoMark />
          PlanyourTasks
        </Link>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div>
            <h1 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {content.title}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{content.intro}</p>
          </div>

          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
