import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";

export const metadata = {
  title: "Datenschutz — FriendTasks",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <LogoMark />
          FriendTasks
        </Link>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div>
            <h1 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Datenschutzerklärung
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              FriendTasks ist ein privates, nicht-kommerzielles Hobbyprojekt für die eigene
              Nutzung im Freundeskreis.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
              Welche Daten werden gespeichert?
            </h2>
            <p>
              Bei der Registrierung werden deine E-Mail-Adresse und dein Passwort (verschlüsselt)
              gespeichert. Zusätzlich legst du einen Anzeigenamen, optional ein Profilbild und
              eine Wiedererkennungsfarbe fest. Darüber hinaus speichert die App die Inhalte, die du
              selbst anlegst: Todos, Unteraufgaben, Tags, Gruppen, Listen und deren Mitgliedschaften.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Wo werden die Daten gehostet?</h2>
            <p>
              Die Datenspeicherung und Authentifizierung laufen über Supabase, das Hosting der
              Anwendung über Vercel. Beide Anbieter verarbeiten die Daten in unserem Auftrag; es
              erfolgt keine Weitergabe an weitere Dritte, kein Tracking und keine Werbung.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Cookies</h2>
            <p>
              Es werden ausschließlich technisch notwendige Cookies gesetzt: eines für deine
              angemeldete Sitzung (Supabase Auth) und eines für deine Hell-/Dunkelmodus-Einstellung.
              Es gibt kein Analyse- oder Marketing-Tracking.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Sichtbarkeit deiner Daten</h2>
            <p>
              Persönliche Todos sind nur für dich sichtbar. Todos in einer Gruppe oder einer
              geteilten Liste sind für die Mitglieder dieser Gruppe bzw. Liste sichtbar — technisch
              durchgesetzt über Zugriffsregeln direkt in der Datenbank (Row Level Security).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Deine Rechte</h2>
            <p>
              Du kannst deinen Anzeigenamen und deine Farbe jederzeit in den Einstellungen ändern.
              Du kannst dein Konto samt aller zugehörigen Daten (Todos, Gruppen, Listen,
              Mitgliedschaften) jederzeit vollständig und unwiderruflich löschen, ebenfalls über die
              Einstellungen.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz wende dich direkt an die Person, die dich zu FriendTasks
              eingeladen hat bzw. die diese Instanz betreibt.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
