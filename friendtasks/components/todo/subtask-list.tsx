"use client";

import { useRef, useTransition } from "react";
import { createSubtask, deleteSubtask, toggleSubtask } from "@/lib/actions/todos";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Subtask } from "@/lib/types/todo";

export function SubtaskList({ todoId, subtasks }: { todoId: string; subtasks: Subtask[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleToggle(subtaskId: string, done: boolean) {
    startTransition(() => {
      toggleSubtask(subtaskId, done);
    });
  }

  function handleDelete(subtaskId: string, title: string) {
    if (!confirm(`Unteraufgabe „${title}" wirklich löschen?`)) return;
    startTransition(() => {
      deleteSubtask(subtaskId);
    });
  }

  return (
    <div className="mt-2 space-y-1.5 pl-6">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={subtask.is_done}
            disabled={isPending}
            onChange={(e) => handleToggle(subtask.id, e.target.checked)}
          />
          <span
            className={
              subtask.is_done
                ? "flex-1 text-zinc-400 line-through dark:text-zinc-600"
                : "flex-1 text-zinc-700 dark:text-zinc-300"
            }
          >
            {subtask.title}
          </span>
          <button
            type="button"
            onClick={() => handleDelete(subtask.id, subtask.title)}
            disabled={isPending}
            className="text-zinc-400 hover:text-red-600 disabled:opacity-50"
            aria-label="Unteraufgabe löschen"
          >
            ×
          </button>
        </div>
      ))}
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(() => {
            createSubtask(formData);
          });
          formRef.current?.reset();
        }}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="todoId" value={todoId} />
        <Input
          name="title"
          placeholder="Unteraufgabe hinzufügen…"
          className="py-1 text-sm"
          disabled={isPending}
        />
      </form>
    </div>
  );
}
