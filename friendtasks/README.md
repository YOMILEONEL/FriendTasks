# PlanyourTasks

Todo-App für Freundeskreise, gebaut mit Next.js (App Router) und Supabase. Der Projektüberblick steht in der [README des Repos](../README.md).

## Setup

1. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

2. Supabase-Projekt anlegen, Migrationen ausführen und `.env.local` befüllen: siehe [`docs/supabase-setup.md`](docs/supabase-setup.md).

3. Entwicklungsserver starten:

   ```bash
   npm run dev
   ```

   Die App läuft dann unter [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`, Entwicklungsserver
- `npm run build`, Produktions-Build
- `npm run start`, Produktions-Build lokal starten
- `npm run lint`, ESLint

## Projektstruktur

```
app/            Next.js App Router: Seiten und Layouts
components/     UI-Komponenten (nach Bereich gruppiert)
lib/            Server Actions, Datenzugriff, Validierung, Supabase-Clients, Utilities
supabase/       SQL-Migrationen
docs/           Requirements und Setup-Anleitung
```

## Weiterführend

- [Requirements](docs/todo-app-requirements.md), die vollständige Anforderungsanalyse
- [Supabase-Setup](docs/supabase-setup.md), Schritt-für-Schritt-Anleitung für Datenbank und Umgebungsvariablen
- [Architekturdiagramm](docs/diagram.png), grober Überblick über Seiten, Server Actions und Datenzugriff
