"use client";

import { useTransition } from "react";
import { deleteGroup } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { format } from "@/lib/i18n/format";
import { useT } from "@/components/i18n/locale-provider";

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [isPending, startTransition] = useTransition();
  const t = useT();

  function handleDelete() {
    if (!confirm(format(t("groups.deleteConfirm"), { name: groupName }))) {
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
