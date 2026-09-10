"use client";

import { useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Priority } from "@/lib/types/database";
import type { Todo } from "@/lib/types/todo";

export function TodoForm({
  action,
  todo,
  onDone,
  submitLabel = "Todo erstellen",
}: {
  action: (formData: FormData) => Promise<void>;
  todo?: Pick<Todo, "title" | "description" | "due_date" | "priority">;
  onDone?: () => void;
  submitLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();

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
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={todo?.due_date ?? ""} />
        </div>
        <div className="flex-1">
          <Label htmlFor="priority">Priorität</Label>
          <Select id="priority" name="priority" defaultValue={todo?.priority ?? ("medium" satisfies Priority)}>
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
          </Select>
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
