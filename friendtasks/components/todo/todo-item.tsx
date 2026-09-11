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
import { format } from "@/lib/i18n/format";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import type { Tag, TodoWithRelations } from "@/lib/types/todo";
import type { GroupMember } from "@/lib/types/group";

export function TodoItem({
  todo,
  allTags,
  groupMembers,
  currentUserId,
}: {
  todo: TodoWithRelations;
  allTags: Tag[];
  groupMembers?: GroupMember[];
  currentUserId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useT();
  const locale = useLocale();

  // A friend invited to a personal list can view it but not create, edit,
  // delete or check off its todos — only the list owner can write. Group
  // sub-list todos (group_id set alongside list_id) are unaffected: those
  // stay fully editable by any group member.
  const readOnly = todo.list_id !== null && todo.group_id === null && todo.owner_id !== currentUserId;

  const done = todo.status === "done";
  const dueDate = formatDueDate(todo.due_date, locale);
  const dueTime = formatTimeRange(todo.due_time, todo.due_time_end);
  const openSubtasks = todo.subtasks.filter((s) => !s.is_done).length;

  function handleToggle(checked: boolean) {
    startTransition(() => {
      // todo.due_date is whichever occurrence is currently being shown —
      // the row's real due_date, or a projected/completed one — so this
      // always identifies the right occurrence for a recurring todo too.
      toggleTodoStatus(todo.id, checked, todo.due_date ?? undefined);
    });
  }

  function handleDelete() {
    if (!confirm(format(t("todo.deleteConfirm"), { title: todo.title }))) return;
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
          disabled={isPending || readOnly}
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
                title={todo.recurrence === "weekly" ? t("recurrence.weeklyTooltip") : t("recurrence.monthlyTooltip")}
              >
                ↻ {todo.recurrence === "weekly" ? t("recurrence.weekly") : t("recurrence.monthly")}
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
                {format(t("todo.doneCount"), { done: todo.subtasks.length - openSubtasks, total: todo.subtasks.length })}
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
                {t("todo.claimableBadge")}
              </span>
            )}
          </div>
        </button>
        {!readOnly && (
          <div className="flex gap-1">
            {todo.claimable && todo.assignees.length === 0 && groupMembers && groupMembers.length > 0 && (
              <Button
                variant="ghost"
                className="px-2 py-1 text-xs text-indigo-600"
                onClick={handleClaim}
                disabled={isPending}
              >
                {t("todo.claim")}
              </Button>
            )}
            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={handleDuplicate} disabled={isPending}>
              {t("todo.duplicate")}
            </Button>
            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing((v) => !v)}>
              {editing ? t("common.close") : t("common.edit")}
            </Button>
            <Button variant="ghost" className="px-2 py-1 text-xs text-red-600" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </div>
        )}
      </div>

      {editing && !readOnly && (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <TodoForm
            todo={todo}
            todoId={todo.id}
            groupId={todo.group_id ?? undefined}
            submitLabel={t("common.save")}
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
          {readOnly ? (
            <div className="mt-2 space-y-1.5 pl-6">
              {todo.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={subtask.is_done} disabled className="opacity-60" />
                  <span
                    className={
                      subtask.is_done
                        ? "text-zinc-400 line-through dark:text-zinc-600"
                        : "text-zinc-700 dark:text-zinc-300"
                    }
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <SubtaskList todoId={todo.id} subtasks={todo.subtasks} />
          )}
          {!readOnly && (
            <div className="mt-3">
              <TagPicker
                todoId={todo.id}
                allTags={allTags}
                selectedTagIds={todo.tags.map((t) => t.id)}
              />
            </div>
          )}
          {groupMembers && groupMembers.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs text-zinc-400 dark:text-zinc-500">{t("todo.assignedTo")}</p>
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
