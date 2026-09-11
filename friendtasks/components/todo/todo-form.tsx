"use client";

import { useState, useTransition, type FormEvent } from "react";
import { checkTodoOverlap } from "@/lib/actions/todos";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatTime } from "@/lib/utils/date";
import { format } from "@/lib/i18n/format";
import { useT } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import type { Priority, Recurrence } from "@/lib/types/database";
import type { Todo } from "@/lib/types/todo";

const PRIORITIES: { value: Priority; labelKey: DictionaryKey; className: string }[] = [
  { value: "low", labelKey: "todoForm.priorityLow", className: "bg-zinc-400" },
  { value: "medium", labelKey: "todoForm.priorityMedium", className: "bg-amber-500" },
  { value: "high", labelKey: "todoForm.priorityHigh", className: "bg-red-500" },
];

// Monday-first display order; values themselves match Date#getDay() (0 =
// Sunday) since that's what nextRecurrenceDate expects.
const WEEKDAY_OPTIONS: { value: number; labelKey: DictionaryKey }[] = [
  { value: 1, labelKey: "weekday.1" },
  { value: 2, labelKey: "weekday.2" },
  { value: 3, labelKey: "weekday.3" },
  { value: 4, labelKey: "weekday.4" },
  { value: 5, labelKey: "weekday.5" },
  { value: 6, labelKey: "weekday.6" },
  { value: 0, labelKey: "weekday.0" },
];

export function TodoForm({
  action,
  todo,
  todoId,
  defaultDueDate,
  defaultDueTime,
  defaultDueTimeEnd,
  groupId,
  listId,
  onDone,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  todo?: Pick<
    Todo,
    | "title"
    | "description"
    | "due_date"
    | "due_time"
    | "due_time_end"
    | "priority"
    | "recurrence"
    | "recurrence_until"
    | "recurrence_weekdays"
    | "claimable"
  >;
  // Id of the todo being edited, so it can be excluded from the overlap
  // check below — omit when creating a new todo.
  todoId?: string;
  defaultDueDate?: string;
  defaultDueTime?: string;
  defaultDueTimeEnd?: string;
  groupId?: string;
  // Personal/shared list this todo is filed under — only meaningful when
  // creating a todo from a list's own page (list assignment can't be
  // changed afterwards via this form).
  listId?: string;
  onDone?: () => void;
  submitLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? "medium");
  const [recurrence, setRecurrence] = useState<"none" | Recurrence>(todo?.recurrence ?? "none");
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<Set<number>>(
    new Set(todo?.recurrence_weekdays ?? [])
  );
  const t = useT();

  function toggleWeekday(value: number) {
    setRecurrenceWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const dueDate = String(formData.get("dueDate") ?? "");
      const dueTime = String(formData.get("dueTime") ?? "");
      const dueTimeEnd = String(formData.get("dueTimeEnd") ?? "");

      if (dueDate && dueTime) {
        const overlapping = await checkTodoOverlap({ dueDate, dueTime, dueTimeEnd, excludeTodoId: todoId });
        if (overlapping.length > 0) {
          const proceed = confirm(format(t("todoForm.overlapConfirm"), { names: overlapping.join(", ") }));
          if (!proceed) return;
        }
      }

      await action(formData);
      form.reset();
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {groupId && <input type="hidden" name="groupId" value={groupId} />}
      {listId && <input type="hidden" name="listId" value={listId} />}
      <input type="hidden" name="priority" value={priority} />
      <div>
        <Label htmlFor="title">{t("todoForm.title")}</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={todo?.title}
          placeholder={t("todoForm.titlePlaceholder")}
        />
      </div>
      <div>
        <Label htmlFor="description">{t("todoForm.description")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={todo?.description ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="dueDate">{t("todoForm.dueDate")}</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={todo?.due_date ?? defaultDueDate ?? ""}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="dueTime">{t("todoForm.start")}</Label>
          <Input
            id="dueTime"
            name="dueTime"
            type="time"
            defaultValue={formatTime(todo?.due_time ?? null) ?? defaultDueTime ?? ""}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="dueTimeEnd">{t("todoForm.end")}</Label>
          <Input
            id="dueTimeEnd"
            name="dueTimeEnd"
            type="time"
            defaultValue={formatTime(todo?.due_time_end ?? null) ?? defaultDueTimeEnd ?? ""}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="recurrence">{t("todoForm.recurrence")}</Label>
        <Select
          id="recurrence"
          name="recurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as "none" | Recurrence)}
        >
          <option value="none">{t("common.none")}</option>
          <option value="weekly">{t("recurrence.weekly")}</option>
          <option value="monthly">{t("recurrence.monthly")}</option>
        </Select>
      </div>
      {recurrence === "weekly" && (
        <div>
          <Label>{t("todoForm.recurrenceWeekdays")}</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_OPTIONS.map((day) => {
              const active = recurrenceWeekdays.has(day.value);
              return (
                <label key={day.value}>
                  <input
                    type="checkbox"
                    name="recurrenceWeekdays"
                    value={day.value}
                    checked={active}
                    onChange={() => toggleWeekday(day.value)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {t(day.labelKey)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      {recurrence !== "none" && (
        <div>
          <Label htmlFor="recurrenceUntil">{t("todoForm.recurrenceUntil")}</Label>
          <Input
            id="recurrenceUntil"
            name="recurrenceUntil"
            type="date"
            defaultValue={todo?.recurrence_until ?? ""}
          />
        </div>
      )}
      {groupId && (
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="claimable"
            defaultChecked={todo?.claimable ?? false}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          {t("todo.claimableOption")}
        </label>
      )}
      <div>
        <Label>{t("todoForm.priority")}</Label>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              aria-pressed={priority === p.value}
              title={t(p.labelKey)}
              className={`h-8 w-8 rounded-full ${p.className} transition-shadow ${
                priority === p.value
                  ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-offset-zinc-950 dark:ring-zinc-50"
                  : "opacity-50 hover:opacity-80"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? t("common.saving") : (submitLabel ?? t("todo.createLabel"))}
        </Button>
      </div>
    </form>
  );
}
