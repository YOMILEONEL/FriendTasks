"use client";

import { useTransition } from "react";
import { deleteGroup } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Gruppe „${groupName}" wirklich löschen? Alle Todos dieser Gruppe werden unwiderruflich mitgelöscht.`
      )
    ) {
      return;
    }
    startTransition(() => {
      deleteGroup(groupId);
    });
  }

  return (
    <Button variant="danger" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Löscht…" : "Gruppe löschen"}
    </Button>
  );
}
