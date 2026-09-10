"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  deleteAttachment,
  listTodoAttachments,
  uploadAttachment,
  type AttachmentView,
} from "@/lib/actions/attachments";
import { Button } from "@/components/ui/button";

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ todoId }: { todoId: string }) {
  const [attachments, setAttachments] = useState<AttachmentView[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function refresh() {
    startTransition(async () => {
      const data = await listTodoAttachments(todoId);
      setAttachments(data);
    });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todoId]);

  function handleUpload(formData: FormData) {
    startTransition(async () => {
      try {
        await uploadAttachment(todoId, formData);
        formRef.current?.reset();
        refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
      }
    });
  }

  function handleDelete(attachmentId: string, name: string) {
    if (!confirm(`„${name}" wirklich löschen?`)) return;
    startTransition(async () => {
      await deleteAttachment(attachmentId);
      refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400 dark:text-zinc-500">Anhänge</p>
      {attachments === null ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Lädt…</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Keine Anhänge.</p>
      ) : (
        <ul className="space-y-1">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
              {a.url ? (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 truncate text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {a.file_name}
                </a>
              ) : (
                <span className="min-w-0 truncate text-zinc-500">{a.file_name}</span>
              )}
              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">{formatSize(a.file_size)}</span>
              <button
                type="button"
                onClick={() => handleDelete(a.id, a.file_name)}
                disabled={isPending}
                className="shrink-0 text-xs text-zinc-500 hover:text-red-600 disabled:opacity-50"
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      )}
      <form ref={formRef} action={handleUpload} className="flex items-center gap-2">
        <input
          type="file"
          name="file"
          disabled={isPending}
          className="min-w-0 flex-1 text-xs text-zinc-600 dark:text-zinc-400"
        />
        <Button type="submit" variant="secondary" disabled={isPending} className="shrink-0 px-2 py-1 text-xs">
          Hochladen
        </Button>
      </form>
    </div>
  );
}
