"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatTime } from "@/lib/utils/date";
import type { Priority } from "@/lib/types/database";
import type { Todo } from "@/lib/types/todo";

const PRIORITIES: { value: Priority; label: string; className: string }[] = [
  { value: "low", label: "Niedrig", className: "bg-zinc-400" },
  { value: "medium", label: "Mittel", className: "bg-amber-500" },
  { value: "high", label: "Hoch", className: "bg-red-500" },
];

export function TodoForm({
  action,
  todo,
  defaultDueDate,
  defaultDueTime,
  defaultDueTimeEnd,
  groupId,
  onDone,
  submitLabel = "Todo erstellen",
}: {
  action: (formData: FormData) => Promise<void>;
  todo?: Pick<Todo, "title" | "description" | "due_date" | "due_time" | "due_time_end" | "priority">;
  defaultDueDate?: string;
  defaultDueTime?: string;
  defaultDueTimeEnd?: string;
  groupId?: string;
  onDone?: () => void;
  submitLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? "medium");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      await action(formData);
      form.reset();
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {groupId && <input type="hidden" name="groupId" value={groupId} />}
      <input type="hidden" name="priority" value={priority} />
      <div>
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={todo?.title}
          placeholder="Was ist zu tun?"
        />
      </div>
      <div>
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={todo?.description ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={todo?.due_date ?? defaultDueDate ?? ""}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="dueTime">Start</Label>
          <Input
            id="dueTime"
            name="dueTime"
            type="time"
            defaultValue={formatTime(todo?.due_time ?? null) ?? defaultDueTime ?? ""}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="dueTimeEnd">Ende</Label>
          <Input
            id="dueTimeEnd"
            name="dueTimeEnd"
            type="time"
            defaultValue={formatTime(todo?.due_time_end ?? null) ?? defaultDueTimeEnd ?? ""}
          />
        </div>
      </div>
      <div>
        <Label>Priorität</Label>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              aria-pressed={priority === p.value}
              title={p.label}
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
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Speichert…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
