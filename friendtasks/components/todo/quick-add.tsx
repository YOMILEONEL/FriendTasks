"use client";

import { useState, useTransition, type FormEvent } from "react";
import { quickAddTodo } from "@/lib/actions/todos";
import { parseQuickAdd } from "@/lib/utils/quick-add";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";
import type { Tag } from "@/lib/types/todo";

export function QuickAdd({
  tags,
  members = [],
  groupId,
  listId,
}: {
  tags: Tag[];
  members?: { user_id: string; display_name: string }[];
  groupId?: string;
  listId?: string;
}) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const t = useT();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    const parsed = parseQuickAdd(trimmed, { tags, members });
    const formData = new FormData();
    formData.set("title", parsed.title);
    formData.set("dueDate", parsed.dueDate ?? "");
    formData.set("dueTime", parsed.dueTime ?? "");
    formData.set("recurrence", parsed.recurrence);
    formData.set("tagIds", parsed.tagIds.join(","));
    formData.set("assigneeUserIds", parsed.assigneeUserIds.join(","));
    if (groupId) formData.set("groupId", groupId);
    if (listId) formData.set("listId", listId);

    setValue("");
    startTransition(() => {
      quickAddTodo(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isPending}
        placeholder={t("quickAdd.placeholder")}
      />
      <Button type="submit" variant="secondary" disabled={isPending} className="shrink-0">
        {isPending ? "…" : "+"}
      </Button>
    </form>
  );
}
