"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { createComment, deleteComment, listComments, type CommentView } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CommentList({ todoId }: { todoId: string }) {
  const [comments, setComments] = useState<CommentView[] | null>(null);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const data = await listComments(todoId);
      setComments(data);
    });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todoId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    startTransition(async () => {
      await createComment(todoId, trimmed);
      refresh();
    });
  }

  function handleDelete(commentId: string) {
    if (!confirm("Kommentar wirklich löschen?")) return;
    startTransition(async () => {
      await deleteComment(commentId);
      refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400 dark:text-zinc-500">Kommentare</p>
      {comments === null ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Lädt…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Noch keine Kommentare.</p>
      ) : (
        <ul className="space-y-1.5">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md bg-zinc-50 px-2.5 py-1.5 text-sm dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{c.author_name}</span>
                {c.is_own && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-zinc-400 hover:text-red-600"
                  >
                    Löschen
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Kommentar schreiben…"
          disabled={isPending}
        />
        <Button type="submit" variant="secondary" disabled={isPending} className="shrink-0">
          Senden
        </Button>
      </form>
    </div>
  );
}
