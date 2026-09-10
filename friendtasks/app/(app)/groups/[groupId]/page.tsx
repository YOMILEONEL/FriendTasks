import { notFound } from "next/navigation";
import { verifySession } from "@/lib/data/dal";
import { getGroup } from "@/lib/data/groups";
import { getGroupLists } from "@/lib/data/lists";
import { getGroupTodos, getUserTags } from "@/lib/data/todos";
import { createGroupList } from "@/lib/actions/lists";
import { MemberList } from "@/components/groups/member-list";
import { InviteLink } from "@/components/groups/invite-link";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import { DeleteListButton } from "@/components/lists/delete-list-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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
  const [todos, tags, lists] = await Promise.all([
    getGroupTodos(groupId, filters),
    getUserTags(),
    getGroupLists(groupId),
  ]);

  const currentMember = group.members.find((m) => m.user_id === session.userId);
  const isAdmin = currentMember?.role === "admin";

  const unlistedTodos = todos.filter((t) => !t.list_id);
  const todosByListId = new Map(lists.map((l) => [l.id, todos.filter((t) => t.list_id === l.id)]));

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

      <TodoFilterBar basePath={`/groups/${groupId}`} tags={tags} />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Todos</h2>
        <NewTodo groupId={groupId} />
        <TodoList
          todos={unlistedTodos}
          allTags={tags}
          groupMembers={group.members}
          emptyMessage="Noch keine Todos ohne Liste."
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Listen</h2>
        {lists.map((list) => (
          <div
            key={list.id}
            className="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{list.name}</h3>
              {isAdmin && <DeleteListButton listId={list.id} listName={list.name} />}
            </div>
            <NewTodo groupId={groupId} listId={list.id} />
            <TodoList
              todos={todosByListId.get(list.id) ?? []}
              allTags={tags}
              groupMembers={group.members}
              emptyMessage="Noch keine Todos in dieser Liste."
            />
          </div>
        ))}
        <form action={createGroupList.bind(null, groupId)} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[160px] flex-1">
            <Label htmlFor="listName">Neue Liste</Label>
            <Input id="listName" name="name" required placeholder="z. B. Einkaufen" />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            Erstellen
          </Button>
        </form>
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
