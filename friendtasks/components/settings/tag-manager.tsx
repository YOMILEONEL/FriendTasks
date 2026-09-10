"use client";

import { useRef, useTransition } from "react";
import { createTag, deleteTag } from "@/lib/actions/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tag } from "@/lib/types/todo";

const COLORS = ["#71717a", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];

export function TagManager({ tags }: { tags: Tag[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete(tagId: string, name: string) {
    if (!confirm(`Tag „${name}" wirklich löschen? Er wird von allen Todos entfernt.`)) return;
    startTransition(() => {
      deleteTag(tagId);
    });
  }

  return (
    <div className="max-w-sm space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleDelete(tag.id, tag.name)}
              disabled={isPending}
              aria-label={`Tag ${tag.name} löschen`}
            >
              ×
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Noch keine Tags.</p>
        )}
      </div>
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(() => {
            createTag(formData);
          });
          formRef.current?.reset();
        }}
        className="flex items-center gap-2"
      >
        <Input name="name" placeholder="Neuer Tag" required className="flex-1" />
        <select name="color" defaultValue={COLORS[0]} className="rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
          {COLORS.map((color) => (
            <option key={color} value={color} style={{ backgroundColor: color }}>
              {color}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" disabled={isPending}>
          +
        </Button>
      </form>
    </div>
  );
}
