"use client";

import { useTransition } from "react";
import { leaveList, removeListMember } from "@/lib/actions/lists";
import { format } from "@/lib/i18n/format";
import { useT } from "@/components/i18n/locale-provider";
import type { ListMember } from "@/lib/types/list";

export function ListMemberList({
  listId,
  members,
  currentUserId,
  ownerId,
  isOwner,
}: {
  listId: string;
  members: ListMember[];
  currentUserId: string;
  ownerId: string;
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useT();

  function handleRemove(userId: string, name: string) {
    if (!confirm(format(t("lists.removeConfirm"), { name }))) return;
    startTransition(() => {
      removeListMember(listId, userId);
    });
  }

  function handleLeave() {
    if (!confirm(t("lists.leaveConfirm"))) return;
    startTransition(() => {
      leaveList(listId);
    });
  }

  return (
    <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-900 dark:border-zinc-800">
      {members.map((member) => {
        const isSelf = member.user_id === currentUserId;
        const isListOwner = member.user_id === ownerId;
        return (
          <li key={member.user_id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 truncate text-zinc-900 dark:text-zinc-50">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              <span className="truncate">
                {member.display_name}
                {isSelf && t("common.you")}
              </span>
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {isListOwner && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {t("lists.owner")}
                </span>
              )}
              {isSelf && !isListOwner && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={isPending}
                  className="text-xs text-zinc-500 hover:text-red-600 disabled:opacity-50"
                >
                  {t("common.leave")}
                </button>
              )}
              {isOwner && !isSelf && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.user_id, member.display_name)}
                  disabled={isPending}
                  className="text-xs text-zinc-500 hover:text-red-600 disabled:opacity-50"
                >
                  {t("common.remove")}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
