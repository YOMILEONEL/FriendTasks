"use client";

import { useState, useTransition } from "react";
import { claimTodo, deleteTodo, duplicateTodo, toggleTodoStatus, updateTodo } from "@/lib/actions/todos";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/todo/priority-badge";
import { SubtaskList } from "@/components/todo/subtask-list";
import { TagPicker } from "@/components/todo/tag-picker";
import { TodoForm } from "@/components/todo/todo-form";
import { CommentList } from "@/components/todo/comment-list";
import { AttachmentList } from "@/components/todo/attachment-list";
import { AssigneePicker } from "@/components/groups/assignee-picker";
import { formatDueDate, formatTimeRange } from "@/lib/utils/date";
import type { Tag, TodoWithRelations } from "@/lib/types/todo";
import type { GroupMember } from "@/lib/types/group";

export function TodoItem({
  todo,
  allTags,
  groupMembers,
}: {
  todo: TodoWithRelations;
  allTags: Tag[];
  groupMembers?: GroupMember[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const done = todo.status === "done";
  const dueDate = formatDueDate(todo.due_date);
  const dueTime = formatTimeRange(todo.due_time, todo.due_time_end);
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

  function handleDuplicate() {
    startTransition(() => {
      duplicateTodo(todo.id);
    });
  }

  function handleClaim() {
    startTransition(() => {
      claimTodo(todo.id);
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
            {todo.recurrence && (
              <span
                className="text-xs text-zinc-400 dark:text-zinc-500"
                title={todo.recurrence === "weekly" ? "Wiederholt sich wöchentlich" : "Wiederholt sich monatlich"}
              >
                ↻ {todo.recurrence === "weekly" ? "Wöchentlich" : "Monatlich"}
              </span>
            )}
            {todo.group_name && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                {todo.group_name}
              </span>
            )}
            {todo.list_name && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                {todo.list_name}
              </span>
            )}
            {dueDate && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {dueDate}
                {dueTime && ` · ${dueTime}`}
              </span>
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
            {todo.assignees.map((assignee) => (
              <span
                key={assignee.user_id}
                className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: assignee.color }}
                />
                {assignee.display_name}
              </span>
            ))}
            {todo.claimable && todo.assignees.length === 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Offen für alle
              </span>
            )}
          </div>
        </button>
        <div className="flex gap-1">
          {todo.claimable && todo.assignees.length === 0 && groupMembers && groupMembers.length > 0 && (
            <Button
              variant="ghost"
              className="px-2 py-1 text-xs text-indigo-600"
              onClick={handleClaim}
              disabled={isPending}
            >
              Übernehmen
            </Button>
          )}
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={handleDuplicate} disabled={isPending}>
            Duplizieren
          </Button>
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
            todoId={todo.id}
            groupId={todo.group_id ?? undefined}
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
          {groupMembers && groupMembers.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs text-zinc-400 dark:text-zinc-500">Zugewiesen an</p>
              <AssigneePicker
                todoId={todo.id}
                members={groupMembers}
                selectedUserIds={todo.assignees.map((a) => a.user_id)}
              />
            </div>
          )}
          <div className="mt-3">
            <AttachmentList todoId={todo.id} />
          </div>
          <div className="mt-3">
            <CommentList todoId={todo.id} />
          </div>
        </div>
      )}
    </li>
  );
}
