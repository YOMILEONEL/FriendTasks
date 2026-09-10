# Requirements Engineering: Todo-App für Freundeskreise

## 1. Projektüberblick

**Projektname:** (Platzhalter, z. B. „FriendTasks")

**Zweck:** Eine webbasierte Todo-Anwendung für die private Nutzung innerhalb eines Freundeskreises. Nutzer können persönliche Aufgaben verwalten, Aufgaben mit Freunden teilen und gemeinsame Listen (z. B. für Reisen, WG-Aufgaben, Events) organisieren.

**Zielgruppe:** Kleine, private Gruppen (Freunde, WG, Familie), kein Enterprise-Anspruch, aber solide UX und Datensicherheit.

**Tech-Stack (vorgegeben):**
- Frontend/Backend: **Next.js** (App Router empfohlen, Server Actions/Route Handlers für Backend-Logik)
- Datenbank: **Supabase (PostgreSQL)**
- Auth: **Supabase Auth**
- Hosting: **Vercel**
- Optional: Supabase Realtime für Live-Updates, Supabase Storage für Avatare/Anhänge

---

## 2. Stakeholder

| Rolle | Beschreibung |
|---|---|
| Owner/Entwickler | Du: entwickelt, betreibt, wartet die App |
| Nutzer (Freunde) | Registrierte Mitglieder des Freundeskreises, legen eigene Todos an, treten Gruppen bei |
| Gruppen-Admin | Nutzer, der eine Gruppe erstellt hat, verwaltet Mitglieder |

---

## 3. Funktionale Anforderungen

### 3.1 Authentifizierung & Benutzerverwaltung
- FR-1: Die App ist **öffentlich zugänglich**: jeder kann sich per E-Mail/Passwort selbst registrieren und einloggen (Supabase Auth), keine Einladung durch einen Admin nötig, um überhaupt ein Konto zu erstellen (Einladungen sind nur für den Beitritt zu einzelnen Gruppen relevant, siehe 3.3).
- FR-2: Optional: Login via Magic Link oder OAuth (Google) zur Vereinfachung im Freundeskreis.
- FR-3: Jeder Nutzer hat ein Profil (Anzeigename, Avatar, optional Farbe/Icon zur Wiedererkennung in Listen).
- FR-4: Passwort-Reset-Funktion.
- FR-5: Nutzer können ihr Konto und alle zugehörigen Daten löschen (DSGVO-relevant, siehe Abschnitt 5.4).

### 3.2 Persönliche Todos
- FR-6: Nutzer können eigene Todos erstellen, bearbeiten, löschen, als erledigt markieren.
- FR-7: Ein Todo besitzt: Titel, Beschreibung (optional), Fälligkeitsdatum (optional), Priorität (niedrig/mittel/hoch), Status (offen/erledigt), Erstellungs-/Änderungsdatum.
- FR-8: Todos können Tags/Kategorien zugeordnet werden (z. B. „privat", „Uni", „Sport").
- FR-9: Filter- und Sortierfunktion (nach Fälligkeit, Priorität, Status, Tag).

### 3.3 Gruppen & geteilte Listen
- FR-10: Nutzer können Gruppen erstellen (z. B. „WG Küche", „Urlaub Italien").
- FR-11: Gruppen-Ersteller kann Mitglieder per Einladungslink oder E-Mail einladen.
- FR-12: Eingeladene Nutzer müssen Einladung annehmen, um Mitglied zu werden.
- FR-13: Innerhalb einer Gruppe können gemeinsame Todo-Listen erstellt werden.
- FR-14: Todos in einer geteilten Liste können einem oder mehreren Gruppenmitgliedern zugewiesen werden.
- FR-15: Jedes Gruppenmitglied sieht Änderungen anderer Mitglieder (Echtzeit-Update via Supabase Realtime, mindestens aber nach Reload).
- FR-16: Gruppen-Admin kann Mitglieder entfernen oder die Gruppe löschen.
- FR-17: Aktivitätsprotokoll pro Gruppe (wer hat was wann erledigt/geändert), mindestens rudimentär.
- FR-17b: Es gibt **keine feste Obergrenze für die Gruppengröße**: das Datenmodell (m:n über `group_members`) skaliert ohne Limit; NFR-3 (Skalierbarkeit) bleibt trotzdem als Rahmenannahme gültig, da die App primär für kleine bis mittlere Freundeskreise ausgelegt ist.

### 3.4 Benachrichtigungen (Phase 2)
- FR-18: Nutzer erhalten eine **In-App-Benachrichtigung** (z. B. Glocken-Icon mit Badge/Dropdown), wenn ihnen ein Todo zugewiesen wird, wenn jemand kommentiert, oder wenn ein Todo in einer Gruppe fällig wird.
- FR-19: **E-Mail-Benachrichtigungen sind nicht vorgesehen**: In-App reicht laut Anforderung vollständig aus. Das vereinfacht die Architektur (kein E-Mail-Versand/Cron-Job nötig, nur Realtime/Polling gegen die `notifications`-Tabelle in Supabase).

### 3.5 Zusammenarbeit
- FR-20: Kommentarfunktion pro Todo innerhalb einer Gruppe (kurzer Chat/Notiz-Thread).
- FR-21: Möglichkeit, Todos zu duplizieren oder als Vorlage zu speichern (z. B. wiederkehrende Aufgaben wie „Müll rausbringen").
- FR-22: Wiederkehrende Todos (täglich/wöchentlich/monatlich, z. B. „jeden Montag" oder „jeden letzten Freitag im Monat"), Phase 2.

### 3.6 Von bestehenden Apps inspirierte Zusatzfunktionen

Recherche zu etablierten Apps (Todoist, TickTick, Any.do, Microsoft To Do) liefert folgende, für einen Freundeskreis sinnvolle Ideen:

**Task-Struktur & Eingabe**
- FR-23: **Subtasks/Checklisten** innerhalb eines Todos (z. B. „Einkaufen" → „Milch", „Brot", „Eier" als abhakbare Unterpunkte).
- FR-24: **Quick-Add mit natürlicher Sprache**: Eingabe wie „Müll rausbringen jeden Montag 18 Uhr #WG @Max" wird automatisch in Fälligkeitsdatum, Tag/Kategorie und Zuweisung geparst (Phase 2/3, Komfortfeature).
- FR-25: **Sub-Listen/Ordner** zur Strukturierung mehrerer Listen innerhalb einer Gruppe (analog zu Todoist-Unterprojekten).
- FR-26: **Datei-Anhänge** an Todos (z. B. Foto vom Einkaufszettel, Rechnung), via Supabase Storage.

**Ansichten & Organisation**
- FR-27: **Smart Lists**: vordefinierte Ansichten „Heute", „Diese Woche", „Ohne Datum", „Mir zugewiesen" über alle persönlichen und Gruppen-Todos hinweg.
- FR-28: **Kalenderansicht** (Tag/Woche/Monat) zur Visualisierung aller Todos mit Fälligkeitsdatum.
- FR-29: Unterscheidung **„Persönliche Liste" vs. „Geteilte/Gruppen-Liste"** analog zu Todoists „Personal Projects" vs. „Team Projects": persönliche Listen bleiben standardmäßig privat, können aber optional mit einzelnen Freunden geteilt werden (nicht nur über ganze Gruppen).
- FR-30: Freigabe einzelner Listen per **Einladungslink** (z. B. „Teile diese Liste" → Link kopieren) als Alternative zur klassischen Gruppenverwaltung.

**Motivation & Produktivität**
- FR-31: **Gamification/Karma-Punkte** für erledigte Todos (optional, Phase 3), motiviert im Freundeskreis, ähnlich Todoists Karma-System.
- FR-32: **Habit-Tracker** für wiederkehrende persönliche Gewohnheiten mit Streak-Anzeige (optional, Phase 3-4).
- FR-33: **Pomodoro-Timer** pro Todo zur fokussierten Bearbeitung (optional, „Nice-to-have", eher für persönliche als für Gruppen-Todos relevant).

**Kollaboration & Transparenz**
- FR-34: **Gebündelte Benachrichtigungen** statt Einzel-Alerts (z. B. „3 neue Kommentare in WG Küche"), ergänzend zum Aktivitätsprotokoll aus FR-17.
- FR-35: **Notizen auf Gruppen-/Listenebene**, unabhängig von einzelnen Todos (z. B. Einkaufsliste-übergreifende Hinweise, WLAN-Passwort für Urlaubsgruppe).
- FR-36: Mehrfachzuweisung: Ein Todo kann mehreren Personen zugewiesen werden, aber auch als „von irgendjemandem erledigbar" markiert werden (kein fester Owner), nützlich für Freundeskreis-Kontext ohne strikte Verantwortlichkeiten.

---

## 4. Nicht-funktionale Anforderungen

### 4.1 Performance
- NFR-1: Ladezeit der Hauptansicht < 1,5 s bei normaler Verbindung (Next.js Server-Side Rendering/Static Generation nutzen, wo sinnvoll).
- NFR-2: Datenbankabfragen über Supabase sollten durch Indizes (z. B. auf `user_id`, `group_id`, `due_date`) performant bleiben.

### 4.2 Skalierbarkeit
- NFR-3: Architektur muss für kleine Nutzergruppen (bis ca. 50-100 Nutzer) ausreichen; keine Enterprise-Skalierung nötig, aber Datenmodell sollte erweiterbar bleiben.

### 4.3 Usability
- NFR-4: Mobile-first Design, da Nutzung häufig unterwegs erfolgt (Responsive UI, ggf. PWA-fähig).
- NFR-5: Intuitive Bedienung ohne Anleitung, max. 3 Klicks bis zum Anlegen eines Todos.
- NFR-13: **Dark Mode** mit manuellem **Toggle** (Light/Dark), vom Nutzer explizit umschaltbar (nicht nur automatisch nach OS-Einstellung) und persistiert pro Nutzer (z. B. in `profiles` oder lokal per Cookie/LocalStorage).

### 4.4 Sicherheit & Datenschutz
- NFR-6: **Row Level Security (RLS)** in Supabase muss konsequent genutzt werden, sodass Nutzer nur eigene Daten bzw. Daten ihrer Gruppen sehen/bearbeiten können.
- NFR-7: Sensible Umgebungsvariablen (Supabase Service Role Key etc.) dürfen niemals im Client-Code oder in Next.js Client Components landen, nur in Server-Kontext/Vercel Environment Variables.
- NFR-8: Da persönliche Daten von Freunden verarbeitet werden, sollte eine minimale Datenschutzerklärung vorhanden sein, auch wenn es sich um ein privates Projekt handelt.
- NFR-9: Möglichkeit zum vollständigen Löschen des eigenen Accounts inkl. aller Daten (Cascade Delete in Postgres).

### 4.5 Wartbarkeit
- NFR-10: Klare Trennung von UI-Komponenten, Server-Logik (Server Actions) und Datenzugriff (Supabase Client Wrapper).
- NFR-11: TypeScript durchgängig nutzen für Typsicherheit zwischen Frontend und Datenbankschema (z. B. via Supabase-generierten Types).

### 4.6 Verfügbarkeit
- NFR-12: Da Hobby-Projekt auf Vercel Free/Hobby-Tier und Supabase Free-Tier läuft, ist 100 % Verfügbarkeit kein Ziel, gelegentliche Cold-Starts akzeptabel.

---

## 5. Datenmodell (grobe Struktur, PostgreSQL/Supabase)

**Tabellen (vereinfacht):**

- `profiles` (1:1 mit `auth.users`)
  - `id` (uuid, FK zu auth.users)
  - `display_name`, `avatar_url`, `created_at`

- `groups`
  - `id`, `name`, `created_by` (FK profiles), `created_at`

- `group_members`
  - `group_id` (FK groups), `user_id` (FK profiles), `role` (admin/member), `joined_at`

- `todos`
  - `id`, `title`, `description`, `due_date`, `priority`, `status`
  - `owner_id` (FK profiles), für persönliche Todos
  - `group_id` (FK groups, nullable), falls Todo in einer Gruppe liegt
  - `created_at`, `updated_at`

- `todo_assignees`
  - `todo_id` (FK todos), `user_id` (FK profiles)

- `todo_comments`
  - `id`, `todo_id`, `author_id`, `content`, `created_at`

- `tags` / `todo_tags` (m:n Beziehung für Kategorisierung)

- `notifications`
  - `id`, `user_id` (FK profiles, Empfänger), `type` (assigned/comment/due_soon), `todo_id` (FK todos, nullable), `group_id` (FK groups, nullable), `is_read` (boolean), `created_at`
  - Ausschließlich für **In-App-Benachrichtigungen** (kein E-Mail-Versand, siehe FR-19)

**Wichtig:** Row Level Security Policies pro Tabelle definieren (z. B. „Nutzer sieht Todo nur, wenn `owner_id = auth.uid()` ODER Nutzer ist Mitglied der `group_id`").

---

## 6. Exemplarische User Stories

1. Als Nutzer möchte ich meine persönlichen Aufgaben anlegen und abhaken können, damit ich meinen Alltag organisiert bekomme.
2. Als Nutzer möchte ich eine Gruppe mit meinen Mitbewohnern erstellen, damit wir gemeinsame Haushaltsaufgaben verteilen können.
3. Als Gruppenmitglied möchte ich sehen, wer welche Aufgabe erledigt hat, damit Verantwortlichkeiten klar sind.
4. Als Nutzer möchte ich benachrichtigt werden, wenn mir eine Aufgabe zugewiesen wird, damit ich nichts verpasse.
5. Als Gruppen-Admin möchte ich Mitglieder entfernen können, falls jemand die Gruppe verlässt.

---

## 7. Abgrenzung (Out of Scope für v1)

- Keine native Mobile-App (nur responsive Web/PWA).
- Keine komplexen Berechtigungsrollen jenseits „Admin/Member".
- Keine Zahlungsfunktionen.
- Keine Mehrsprachigkeit in v1 (Deutsch oder Englisch als Basissprache reicht).
- Keine externe Kalender-Integration (Google Calendar Sync) in v1, interne Kalenderansicht (FR-28) reicht zunächst.
- Kein Pomodoro-Timer, kein Habit-Tracker und keine Gamification in v1, diese Komfortfeatures aus Abschnitt 3.6 sind explizit spätere Phasen.
- Keine Offline-Nutzung mit lokaler Synchronisation in v1 (nur Online-Betrieb; PWA-Offline-Support ist ein späteres Ziel).

---

## 8. Grobe Meilensteine

| Phase | Inhalt |
|---|---|
| Phase 1 (MVP) | Auth, persönliche Todos (CRUD), Subtasks/Checklisten (FR-23), Basis-UI, Smart Lists (FR-27) |
| Phase 2 | Gruppen, geteilte Listen, Zuweisungen, RLS-Policies, Sub-Listen/Ordner (FR-25), Listenfreigabe per Link (FR-30), Kalenderansicht (FR-28) |
| Phase 3 | Benachrichtigungen (inkl. gebündelt, FR-34), wiederkehrende Todos, Kommentare, Quick-Add mit natürlicher Sprache (FR-24), Datei-Anhänge (FR-26), Listen-Notizen (FR-35) |
| Phase 4 | Polishing, PWA/Offline, Gamification (FR-31), Habit-Tracker (FR-32), Pomodoro-Timer (FR-33) |

---

## 9. Geklärte Grundsatzentscheidungen

| Frage | Entscheidung | Auswirkung |
|---|---|---|
| Registrierung offen oder nur per Einladung? | **Öffentlich zugänglich**: jeder kann sich registrieren (FR-1) | Kein Invite-Only-Gate für Accounts; Einladungen bleiben nur auf Gruppenebene relevant (FR-11/FR-12) |
| Limitierung der Gruppengröße? | **Keine Limitierung** (FR-17b) | Datenmodell muss uneingeschränkt viele `group_members` pro Gruppe zulassen; keine harte Prüfung im Code nötig |
| E-Mail- oder In-App-Benachrichtigungen? | **Nur In-App** (FR-18/FR-19) | Kein E-Mail-Versand/Cron-Job in v1 nötig, reduziert Komplexität; `notifications`-Tabelle reicht aus |
| Dark Mode? | **Ja, mit manuellem Toggle** (NFR-13) | UI-Theme-System (z. B. via CSS-Variablen/Tailwind `dark:`-Klassen) und Persistierung der Nutzerwahl einplanen |

Damit sind alle zuvor offenen Fragen geklärt; es bestehen aktuell keine offenen Punkte vor Implementierungsstart.
