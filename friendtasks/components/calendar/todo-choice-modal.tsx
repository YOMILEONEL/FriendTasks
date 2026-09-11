"use client";

import { formatTimeRange } from "@/lib/utils/date";
import { useT } from "@/components/i18n/locale-provider";
import type { TodoWithRelations } from "@/lib/types/todo";

// Two or more todos landed in the same calendar slot (same day, same start
// hour) — rather than one click silently opening whichever happens to be on
// top, this lets the user pick which one they meant.
export function TodoChoiceModal({
  todos,
  onSelect,
  onClose,
}: {
  todos: TodoWithRelations[];
  onSelect: (todo: TodoWithRelations) => void;
  onClose: () => void;
}) {
  const t = useT();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-xl bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{t("calendar.chooseTodo")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="text-xl leading-none text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            ×
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {todos.map((todo) => (
            <li key={todo.id}>
              <button
                type="button"
                onClick={() => onSelect(todo)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span
                  className={
                    todo.status === "done"
                      ? "min-w-0 truncate text-zinc-400 line-through dark:text-zinc-600"
                      : "min-w-0 truncate text-zinc-900 dark:text-zinc-50"
                  }
                >
                  {todo.title}
                </span>
                <span className="ml-auto shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                  {formatTimeRange(todo.due_time, todo.due_time_end)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
