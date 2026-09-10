"use client";

import { useTransition } from "react";
import { createTodo, deleteTodo, updateTodo } from "@/lib/actions/todos";
import { TodoForm } from "@/components/todo/todo-form";
import { formatDayLabel } from "@/lib/utils/date";
import type { TodoWithRelations } from "@/lib/types/todo";

export function TodoModal({
  date,
  time,
  todo,
  onClose,
}: {
  date: string;
  time?: string;
  todo?: TodoWithRelations;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const action = todo ? updateTodo.bind(null, todo.id) : createTodo;

  function handleDelete() {
    if (!todo) return;
    if (!confirm(`„${todo.title}" wirklich löschen?`)) return;
    startTransition(() => {
      deleteTodo(todo.id);
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
            {todo ? "Todo bearbeiten" : "Neues Todo"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="text-xl leading-none text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">{formatDayLabel(date)}</p>
          <TodoForm
            action={action}
            todo={todo}
            todoId={todo?.id}
            groupId={todo?.group_id ?? undefined}
            defaultDueDate={date}
            defaultDueTime={time}
            submitLabel={todo ? "Speichern" : "Erstellen"}
            onDone={onClose}
          />
          {todo && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="mt-3 text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              Todo löschen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
