// Best-effort natural-language parsing for quick-add (FR-24), e.g.
// "Müll rausbringen jeden Montag 18 Uhr #WG @Max" or its English
// equivalent "Take out trash every Monday 6pm #WG @Max". Deliberately
// simple (hand-rolled regexes, no NLP library): it only has to get the
// common case right, since whatever it gets wrong is still fully editable
// afterwards. Recognizes both German and English keywords regardless of
// the current UI language, since the app itself is bilingual now.

interface Weekday {
  names: string[];
  index: number; // matches Date#getDay() (0 = Sunday)
}

const WEEKDAYS: Weekday[] = [
  { names: ["montag", "monday"], index: 1 },
  { names: ["dienstag", "tuesday"], index: 2 },
  { names: ["mittwoch", "wednesday"], index: 3 },
  { names: ["donnerstag", "thursday"], index: 4 },
  { names: ["freitag", "friday"], index: 5 },
  { names: ["samstag", "saturday"], index: 6 },
  { names: ["sonntag", "sunday"], index: 0 },
];

function nextWeekdayISO(targetIndex: number): string {
  const today = new Date();
  const diff = (targetIndex - today.getDay() + 7) % 7;
  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface QuickAddContext {
  tags: { id: string; name: string }[];
  members: { user_id: string; display_name: string }[];
}

export interface QuickAddResult {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  recurrence: "weekly" | "none";
  tagIds: string[];
  assigneeUserIds: string[];
}

export function parseQuickAdd(input: string, context: QuickAddContext): QuickAddResult {
  let remaining = input;
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  let recurrence: "weekly" | "none" = "none";

  const weekdayPattern = WEEKDAYS.flatMap((w) => w.names).join("|");

  const recurringMatch = remaining.match(new RegExp(`(?:jeden|every)\\s+(${weekdayPattern})`, "i"));
  if (recurringMatch) {
    const weekday = WEEKDAYS.find((w) => w.names.includes(recurringMatch[1].toLowerCase()));
    if (weekday) {
      dueDate = nextWeekdayISO(weekday.index);
      recurrence = "weekly";
      remaining = remaining.replace(recurringMatch[0], " ");
    }
  } else {
    const onceMatch = remaining.match(new RegExp(`\\b(${weekdayPattern})s?\\b`, "i"));
    if (onceMatch) {
      const matched = onceMatch[1].toLowerCase();
      const weekday = WEEKDAYS.find((w) => w.names.includes(matched));
      if (weekday) {
        dueDate = nextWeekdayISO(weekday.index);
        remaining = remaining.replace(onceMatch[0], " ");
      }
    }
  }

  // German "18 Uhr" / "18:30 Uhr".
  const uhrMatch = remaining.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*uhr\b/i);
  // English "6pm" / "6:30pm" / "6 pm".
  const ampmMatch = remaining.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  // Bare 24h "18:30".
  const bareTimeMatch = remaining.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);

  if (uhrMatch) {
    dueTime = `${uhrMatch[1].padStart(2, "0")}:${(uhrMatch[2] ?? "00").padStart(2, "0")}`;
    remaining = remaining.replace(uhrMatch[0], " ");
  } else if (ampmMatch) {
    let hour = Number(ampmMatch[1]) % 12;
    if (ampmMatch[3].toLowerCase() === "pm") hour += 12;
    dueTime = `${String(hour).padStart(2, "0")}:${(ampmMatch[2] ?? "00").padStart(2, "0")}`;
    remaining = remaining.replace(ampmMatch[0], " ");
  } else if (bareTimeMatch) {
    dueTime = `${bareTimeMatch[1].padStart(2, "0")}:${bareTimeMatch[2]}`;
    remaining = remaining.replace(bareTimeMatch[0], " ");
  }

  const tagIds: string[] = [];
  remaining = remaining.replace(/#(\S+)/g, (_match, name: string) => {
    const tag = context.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (tag) tagIds.push(tag.id);
    return " ";
  });

  const assigneeUserIds: string[] = [];
  remaining = remaining.replace(/@(\S+)/g, (_match, name: string) => {
    const member = context.members.find((m) => m.display_name.toLowerCase().startsWith(name.toLowerCase()));
    if (member) assigneeUserIds.push(member.user_id);
    return " ";
  });

  const title = remaining.replace(/\s+/g, " ").trim() || input.trim();

  return { title, dueDate, dueTime, recurrence, tagIds, assigneeUserIds };
}
