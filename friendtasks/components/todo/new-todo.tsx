"use client";

import { useState } from "react";
import { createTodo } from "@/lib/actions/todos";
import { Button } from "@/components/ui/button";
import { TodoForm } from "@/components/todo/todo-form";

export function NewTodo({
  defaultDueDate,
  defaultDueTime,
  groupId,
  startOpen = false,
}: {
  defaultDueDate?: string;
  defaultDueTime?: string;
  groupId?: string;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="w-full justify-center">
        + Neues Todo
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <TodoForm
        action={createTodo}
        defaultDueDate={defaultDueDate}
        defaultDueTime={defaultDueTime}
        groupId={groupId}
        // Once opened via startOpen (e.g. the calendar day panel), keep the
        // form available for adding more than one todo to the same day.
        onDone={startOpen ? undefined : () => setOpen(false)}
      />
    </div>
  );
}
