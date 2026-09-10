"use client";

import { useState, useTransition } from "react";
import { setTodoAssignees } from "@/lib/actions/todos";
import type { GroupMember } from "@/lib/types/group";

export function AssigneePicker({
  todoId,
  members,
  selectedUserIds,
}: {
  todoId: string;
  members: GroupMember[];
  selectedUserIds: string[];
}) {
  const [selected, setSelected] = useState(new Set(selectedUserIds));
  const [isPending, startTransition] = useTransition();

  function toggle(userId: string) {
    const next = new Set(selected);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setSelected(next);
    startTransition(() => {
      setTodoAssignees(todoId, Array.from(next));
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {members.map((member) => {
        const active = selected.has(member.user_id);
        return (
          <button
            key={member.user_id}
            type="button"
            disabled={isPending}
            onClick={() => toggle(member.user_id)}
            className={`rounded-full border px-2 py-0.5 text-xs transition-colors disabled:opacity-50 ${
              active
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {member.display_name}
          </button>
        );
      })}
    </div>
  );
}
