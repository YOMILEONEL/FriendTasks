"use client";

import { useTransition } from "react";
import { deleteGroup } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { format } from "@/lib/i18n/format";
import { useT } from "@/components/i18n/locale-provider";
import { useConfirm } from "@/components/shared/confirm-provider";

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [isPending, startTransition] = useTransition();
  const t = useT();
  const confirm = useConfirm();

  async function handleDelete() {
    if (!(await confirm({ message: format(t("groups.deleteConfirm"), { name: groupName }), danger: true }))) {
      return;
    }
    startTransition(() => {
      deleteGroup(groupId);
    });
  }

  return (
    <Button variant="danger" onClick={handleDelete} disabled={isPending}>
      {isPending ? t("common.deleting") : t("groups.delete")}
    </Button>
  );
}
