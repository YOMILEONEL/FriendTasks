"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";
import { useConfirm } from "@/components/shared/confirm-provider";

export function DeleteAccount() {
  const [isPending, startTransition] = useTransition();
  const t = useT();
  const confirm = useConfirm();

  async function handleDelete() {
    if (!(await confirm({ message: t("account.deleteConfirm"), danger: true }))) {
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
