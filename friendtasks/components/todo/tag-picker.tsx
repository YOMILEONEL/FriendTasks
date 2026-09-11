"use client";

import { useState, useTransition } from "react";
import { setTodoTags } from "@/lib/actions/todos";
import { useT } from "@/components/i18n/locale-provider";
import type { Tag } from "@/lib/types/todo";

export function TagPicker({
  todoId,
  allTags,
  selectedTagIds,
}: {
  todoId: string;
  allTags: Tag[];
  selectedTagIds: string[];
}) {
  const [selected, setSelected] = useState(new Set(selectedTagIds));
  const [isPending, startTransition] = useTransition();
  const t = useT();

  function toggle(tagId: string) {
    const next = new Set(selected);
    if (next.has(tagId)) {
      next.delete(tagId);
    } else {
      next.add(tagId);
    }
    setSelected(next);
    startTransition(() => {
      setTodoTags(todoId, Array.from(next));
    });
  }

  if (allTags.length === 0) {
    return (
      <p className="text-xs text-zinc-400 dark:text-zinc-500">{t("tags.noneYet")}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {allTags.map((tag) => {
        const active = selected.has(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            disabled={isPending}
            onClick={() => toggle(tag.id)}
            className="rounded-full border px-2 py-0.5 text-xs transition-colors disabled:opacity-50"
            style={{
              borderColor: tag.color,
              backgroundColor: active ? tag.color : "transparent",
              color: active ? "#fff" : tag.color,
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
