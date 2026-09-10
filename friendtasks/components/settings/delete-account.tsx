"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

export function DeleteAccount() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        "Konto und alle zugehörigen Daten unwiderruflich löschen? Dies kann nicht rückgängig gemacht werden."
      )
    ) {
      return;
    }
    startTransition(() => {
      deleteAccount();
    });
  }

  return (
    <Button variant="danger" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Löscht…" : "Konto löschen"}
    </Button>
  );
}
