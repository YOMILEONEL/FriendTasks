"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

interface JoinRequestItem {
  id: string;
  display_name: string;
  avatar_url: string | null;
  color: string;
}

// Shared by the group and personal-list detail pages — only ever rendered
// for an admin/owner (the RLS-scoped data fetch already guarantees a
// regular member's query returns nothing), approve/decline just differ in
// which server action they call.
export function JoinRequests({
  requests,
  onApprove,
  onDecline,
}: {
  requests: JoinRequestItem[];
  onApprove: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useT();

  if (requests.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("shared.noJoinRequests")}</p>;
  }

  return (
    <ul className="space-y-2">
      {requests.map((request) => (
        <li
          key={request.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: request.color }}
            />
            <span className="truncate">{request.display_name}</span>
          </span>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={isPending}
              onClick={() => startTransition(() => onApprove(request.id))}
            >
              {t("common.approve")}
            </Button>
            <Button
              variant="ghost"
              className="px-2 py-1 text-xs text-red-600"
              disabled={isPending}
              onClick={() => startTransition(() => onDecline(request.id))}
            >
              {t("common.decline")}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
