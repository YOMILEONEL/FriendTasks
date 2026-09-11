"use client";

import { useT } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import type { Priority } from "@/lib/types/database";

const LABEL_KEYS: Record<Priority, DictionaryKey> = {
  low: "todoForm.priorityLow",
  medium: "todoForm.priorityMedium",
  high: "todoForm.priorityHigh",
};

const CLASSES: Record<Priority, string> = {
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const t = useT();
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CLASSES[priority]}`}>
      {t(LABEL_KEYS[priority])}
    </span>
  );
}
