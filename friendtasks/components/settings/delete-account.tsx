"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

export function DeleteAccount() {
  const [isPending, startTransition] = useTransition();
  const t = useT();

  function handleDelete() {
    if (!confirm(t("account.deleteConfirm"))) {
      return;
    }
    startTransition(() => {
      deleteAccount();
    });
  }

  return (
    <Button variant="danger" onClick={handleDelete} disabled={isPending}>
      {isPending ? t("common.deleting") : t("account.delete")}
    </Button>
  );
}
