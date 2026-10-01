"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { createComment, deleteComment, listComments, type CommentView } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/components/i18n/locale-provider";
import { useConfirm } from "@/components/shared/confirm-provider";

export function CommentList({ todoId }: { todoId: string }) {
  const [comments, setComments] = useState<CommentView[] | null>(null);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const t = useT();
  const confirm = useConfirm();

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

  async function handleDelete(commentId: string) {
    if (!(await confirm({ message: t("comments.deleteConfirm"), danger: true }))) return;
    startTransition(async () => {
      await deleteComment(commentId);
      refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400 dark:text-zinc-500">{t("comments.title")}</p>
      {comments === null ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{t("common.loading")}</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{t("comments.empty")}</p>
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
                    {t("common.delete")}
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
          placeholder={t("comments.placeholder")}
          disabled={isPending}
        />
        <Button type="submit" variant="secondary" disabled={isPending} className="shrink-0">
          {t("common.send")}
        </Button>
      </form>
    </div>
  );
}
