"use client";

import { useState, useTransition } from "react";
import { deleteTodo, toggleTodoStatus, updateTodo } from "@/lib/actions/todos";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/todo/priority-badge";
import { SubtaskList } from "@/components/todo/subtask-list";
import { TagPicker } from "@/components/todo/tag-picker";
import { TodoForm } from "@/components/todo/todo-form";
import { formatDueDate } from "@/lib/utils/date";
import type { Tag, TodoWithRelations } from "@/lib/types/todo";

export function TodoItem({ todo, allTags }: { todo: TodoWithRelations; allTags: Tag[] }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const done = todo.status === "done";
  const dueDate = formatDueDate(todo.due_date);
  const openSubtasks = todo.subtasks.filter((s) => !s.is_done).length;

  function handleToggle(checked: boolean) {
    startTransition(() => {
      toggleTodoStatus(todo.id, checked);
    });
  }

  function handleDelete() {
    if (!confirm(`„${todo.title}" wirklich löschen?`)) return;
    startTransition(() => {
      deleteTodo(todo.id);
    });
  }

  return (
    <li className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={done}
          disabled={isPending}
          onChange={(e) => handleToggle(e.target.checked)}
          className="mt-0.5"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                done
                  ? "text-zinc-400 line-through dark:text-zinc-600"
                  : "text-zinc-900 dark:text-zinc-50"
              }
            >
              {todo.title}
            </span>
            <PriorityBadge priority={todo.priority} />
            {dueDate && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{dueDate}</span>
            )}
            {todo.subtasks.length > 0 && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {todo.subtasks.length - openSubtasks}/{todo.subtasks.length} erledigt
              </span>
            )}
            {todo.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: tag.color, color: "#fff" }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </button>
        <div className="flex gap-1">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing((v) => !v)}>
            {editing ? "Schließen" : "Bearbeiten"}
          </Button>
          <Button variant="ghost" className="px-2 py-1 text-xs text-red-600" onClick={handleDelete}>
            Löschen
          </Button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <TodoForm
            todo={todo}
            submitLabel="Speichern"
            action={updateTodo.bind(null, todo.id)}
            onDone={() => setEditing(false)}
          />
        </div>
      )}

      {expanded && !editing && (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {todo.description && (
            <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
              {todo.description}
            </p>
          )}
          <SubtaskList todoId={todo.id} subtasks={todo.subtasks} />
          <div className="mt-3">
            <TagPicker
              todoId={todo.id}
              allTags={allTags}
              selectedTagIds={todo.tags.map((t) => t.id)}
            />
          </div>
        </div>
      )}
    </li>
  );
}
