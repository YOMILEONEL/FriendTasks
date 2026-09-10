# Supabase-Setup für FriendTasks

## 1. Projekt anlegen

1. Auf [supabase.com](https://supabase.com) ein neues Projekt erstellen.
2. Unter **Settings → API** die folgenden Werte notieren:
   - `Project URL`
   - `anon` `public` Key
   - `service_role` Key (geheim halten!)

## 2. Migration ausführen

Im Supabase Dashboard unter **SQL Editor** eine neue Query öffnen, den Inhalt von
`supabase/migrations/0001_init.sql` einfügen und ausführen. Das legt alle Tabellen,
Indizes, Trigger und RLS-Policies an.

Alternativ mit der [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started):

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## 3. Environment-Variablen setzen

`.env.example` nach `.env.local` kopieren und die drei Werte aus Schritt 1 eintragen:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` wird ausschließlich serverseitig für die
Account-Löschung (`lib/supabase/admin.ts`) verwendet und darf niemals mit
`NEXT_PUBLIC_` geprefixt oder im Client-Code referenziert werden.

## 4. E-Mail-Bestätigung (Confirm email)

Unter **Authentication → Providers → Email** ist standardmäßig "Confirm email"
aktiviert, neue Nutzer müssen ihre Adresse per Link bestätigen, bevor sie sich
einloggen können. Für lokale Entwicklung ohne konfigurierten SMTP-Versand kann
diese Option vorübergehend deaktiviert werden, dann sind neue Konten sofort
nutzbar.

Für Passwort-Reset (`/reset-password`) muss unter **Authentication → URL
Configuration** die lokale Dev-URL (z. B. `http://localhost:3000`) als
Redirect-URL hinterlegt sein, damit der Link aus der E-Mail zu
`/auth/callback` zurückfindet.

## 5. App starten

```bash
npm run dev
```

Danach unter `http://localhost:3000/signup` ein Konto anlegen und loslegen.
