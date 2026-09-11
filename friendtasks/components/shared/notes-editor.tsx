"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

export function NotesEditor({
  initialContent,
  onSave,
}: {
  initialContent: string;
  onSave: (formData: FormData) => Promise<void>;
}) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const t = useT();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("content", content);
    startTransition(async () => {
      await onSave(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={t("notes.placeholder")}
      />
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? t("common.saving") : saved ? t("common.saved") : t("common.save")}
      </Button>
    </form>
  );
}
