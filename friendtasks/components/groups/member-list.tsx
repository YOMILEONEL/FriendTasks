"use client";

import { useTransition } from "react";
import { leaveGroup, removeMember } from "@/lib/actions/groups";
import type { GroupMember } from "@/lib/types/group";

export function MemberList({
  groupId,
  members,
  currentUserId,
  isAdmin,
}: {
  groupId: string;
  members: GroupMember[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(userId: string, name: string) {
    if (!confirm(`„${name}" wirklich aus der Gruppe entfernen?`)) return;
    startTransition(() => {
      removeMember(groupId, userId);
    });
  }

  function handleLeave() {
    if (!confirm("Diese Gruppe wirklich verlassen?")) return;
    startTransition(() => {
      leaveGroup(groupId);
    });
  }

  return (
    <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-900 dark:border-zinc-800">
      {members.map((member) => {
        const isSelf = member.user_id === currentUserId;
        return (
          <li key={member.user_id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <span className="min-w-0 truncate text-zinc-900 dark:text-zinc-50">
              {member.display_name}
              {isSelf && " (du)"}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {member.role === "admin" && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  Admin
                </span>
              )}
              {isSelf && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={isPending}
                  className="text-xs text-zinc-500 hover:text-red-600 disabled:opacity-50"
                >
                  Verlassen
                </button>
              )}
              {isAdmin && !isSelf && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.user_id, member.display_name)}
                  disabled={isPending}
                  className="text-xs text-zinc-500 hover:text-red-600 disabled:opacity-50"
                >
                  Entfernen
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
