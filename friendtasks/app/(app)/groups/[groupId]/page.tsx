import { notFound } from "next/navigation";
import { verifySession } from "@/lib/data/dal";
import { getGroup } from "@/lib/data/groups";
import { getGroupTodos, getUserTags } from "@/lib/data/todos";
import { MemberList } from "@/components/groups/member-list";
import { InviteLink } from "@/components/groups/invite-link";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import type { TodoFilters } from "@/lib/types/todo";

export default async function GroupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
  const { groupId } = await params;
  const session = await verifySession();

  const group = await getGroup(groupId);
  if (!group) notFound();

  const filters = (await searchParams) as TodoFilters;
  const [todos, tags] = await Promise.all([getGroupTodos(groupId, filters), getUserTags()]);

  const currentMember = group.members.find((m) => m.user_id === session.userId);
  const isAdmin = currentMember?.role === "admin";

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-xl font-semibold">{group.name}</h1>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Mitglieder</h2>
        <MemberList
          groupId={groupId}
          members={group.members}
          currentUserId={session.userId}
          isAdmin={isAdmin}
        />
      </div>

      {isAdmin && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Einladungslink</h2>
          <InviteLink token={group.invite_token} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Todos</h2>
        <NewTodo groupId={groupId} />
        <TodoFilterBar basePath={`/groups/${groupId}`} tags={tags} />
        <TodoList
          todos={todos}
          allTags={tags}
          groupMembers={group.members}
          emptyMessage="Noch keine Todos in dieser Gruppe."
        />
      </div>

      {isAdmin && (
        <div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-red-600 dark:text-red-400">Gefahrenzone</h2>
          <DeleteGroupButton groupId={groupId} groupName={group.name} />
        </div>
      )}
    </div>
  );
}
