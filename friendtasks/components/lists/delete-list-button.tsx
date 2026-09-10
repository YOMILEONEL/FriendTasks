"use client";

import { useTransition } from "react";
import { deleteList } from "@/lib/actions/lists";
import { Button } from "@/components/ui/button";

export function DeleteListButton({
  listId,
  listName,
  confirmMessage,
  redirectTo,
}: {
  listId: string;
  listName: string;
  confirmMessage?: string;
  redirectTo?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        confirmMessage ??
          `Liste „${listName}" wirklich löschen? Enthaltene Todos bleiben erhalten, aber ohne Liste.`
      )
    ) {
      return;
    }
    startTransition(() => {
      deleteList(listId, redirectTo);
    });
  }

  return (
    <Button variant="ghost" className="px-2 py-1 text-xs text-red-600" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Löscht…" : "Löschen"}
    </Button>
  );
}
