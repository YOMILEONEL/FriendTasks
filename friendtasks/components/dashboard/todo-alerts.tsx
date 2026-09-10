import Link from "next/link";
import { formatDueDate, formatTimeRange } from "@/lib/utils/date";
import type { TodoAlerts } from "@/lib/data/todos";
import type { TodoWithRelations } from "@/lib/types/todo";

function AlertItem({ todo }: { todo: TodoWithRelations }) {
  const date = formatDueDate(todo.due_date);
  const time = formatTimeRange(todo.due_time, todo.due_time_end);

  return (
    <li className="flex flex-wrap items-center gap-2 py-1">
      <span className="font-medium">{todo.title}</span>
      {(date || time) && (
        <span className="text-xs opacity-80">
          {date}
          {time && ` · ${time}`}
        </span>
      )}
      {todo.group_name && <span className="text-xs opacity-80">({todo.group_name})</span>}
    </li>
  );
}

export function TodoAlertsBanner({ overdue, dueSoon }: TodoAlerts) {
  if (overdue.length === 0 && dueSoon.length === 0) return null;

  return (
    <div className="space-y-3">
      {overdue.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <p className="font-semibold">
            {overdue.length === 1 ? "1 verpasste Aufgabe" : `${overdue.length} verpasste Aufgaben`}
          </p>
          <ul className="mt-1">
            {overdue.map((todo) => (
              <AlertItem key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      )}
      {dueSoon.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <p className="font-semibold">
            {dueSoon.length === 1
              ? "1 Aufgabe in weniger als einer Stunde fällig"
              : `${dueSoon.length} Aufgaben in weniger als einer Stunde fällig`}
          </p>
          <ul className="mt-1">
            {dueSoon.map((todo) => (
              <AlertItem key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      )}
      <Link
        href="/today"
        className="inline-block text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Zu Heute
      </Link>
    </div>
  );
}
