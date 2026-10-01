"use client";

import { useTransition } from "react";
import { deleteList } from "@/lib/actions/lists";
import { Button } from "@/components/ui/button";
import { format } from "@/lib/i18n/format";
import { useT } from "@/components/i18n/locale-provider";
import { useConfirm } from "@/components/shared/confirm-provider";

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
  const t = useT();
  const confirm = useConfirm();

  async function handleDelete() {
    if (!(await confirm({ message: confirmMessage ?? format(t("lists.deleteConfirmDefault"), { name: listName }), danger: true }))) {
      return;
    }
    startTransition(() => {
      deleteList(listId, redirectTo);
    });
  }

  return (
    <Button variant="ghost" className="px-2 py-1 text-xs text-red-600" onClick={handleDelete} disabled={isPending}>
      {isPending ? t("common.deleting") : t("common.delete")}
    </Button>
  );
}
