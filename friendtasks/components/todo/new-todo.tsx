"use client";

import { useState } from "react";
import { createTodo } from "@/lib/actions/todos";
import { Button } from "@/components/ui/button";
import { TodoForm } from "@/components/todo/todo-form";

export function NewTodo() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="w-full justify-center">
        + Neues Todo
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <TodoForm action={createTodo} onDone={() => setOpen(false)} />
    </div>
  );
}
