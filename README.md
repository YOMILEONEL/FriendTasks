# FriendTasks

Todo-App für Freundeskreise: persönliche Aufgaben, geteilte Gruppen-Listen, Wochenkalender und Zuweisungen. Gebaut mit Next.js und Supabase.

## Funktionen

- **Konto & Login**: Registrierung, Anmeldung, Passwort-Reset, Passwort-Sichtbarkeit umschaltbar
- **Persönliche Todos**: Titel, Beschreibung, Fälligkeitsdatum, Start- und Endzeit, Priorität, Tags, Unteraufgaben
- **Smart Lists**: Heute, Diese Woche, Ohne Datum, Alle, jeweils mit Suche und Filter (Status, Priorität, Tag)
- **Dashboard**: Kennzahlen zu offenen Todos, Schnellzugriff auf alle Bereiche
- **Wochenkalender**: Stundenraster mit durchgehenden Balken für mehrstündige Termine, Klick zum direkten Eintragen
- **Gruppen**: erstellen, per Einladungslink beitreten, Mitglieder verwalten, geteilte Todo-Listen mit Mehrfachzuweisung
- **Dark Mode**: manuell umschaltbar, pro Browser gespeichert
- **Responsive**: Sidebar-Navigation auf Desktop, ausklappbares Menü auf dem Handy

## Tech-Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security)
- [Tailwind CSS](https://tailwindcss.com)
- [Zod](https://zod.dev) für Validierung

## Projekt starten

Der eigentliche Code liegt im Unterordner [`friendtasks/`](friendtasks). Details zum lokalen Setup, zum Anlegen des Supabase-Projekts und zum Ausführen der Datenbank-Migrationen stehen in [`friendtasks/docs/supabase-setup.md`](friendtasks/docs/supabase-setup.md).

```bash
cd friendtasks
npm install
npm run dev
```

## Hintergrund

Die vollständige Anforderungsanalyse (Requirements Engineering) liegt in [`friendtasks/docs/todo-app-requirements.md`](friendtasks/docs/todo-app-requirements.md).
