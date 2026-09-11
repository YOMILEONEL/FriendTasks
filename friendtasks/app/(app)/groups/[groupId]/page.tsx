import { notFound } from "next/navigation";
import { verifySession } from "@/lib/data/dal";
import { getGroup, getGroupJoinRequests } from "@/lib/data/groups";
import { getGroupLists } from "@/lib/data/lists";
import { getGroupTodos, getUserTags } from "@/lib/data/todos";
import { getGroupActivity } from "@/lib/data/activity";
import { getGroupNotes } from "@/lib/data/notes";
import { createGroupList } from "@/lib/actions/lists";
import { approveGroupJoinRequest, declineGroupJoinRequest } from "@/lib/actions/groups";
import { saveGroupNotes } from "@/lib/actions/notes";
import { getDictionary } from "@/lib/i18n/server";
import { MemberList } from "@/components/groups/member-list";
import { InviteLink } from "@/components/groups/invite-link";
import { ActivityFeed } from "@/components/groups/activity-feed";
import { JoinRequests } from "@/components/shared/join-requests";
import { NewTodo } from "@/components/todo/new-todo";
import { QuickAdd } from "@/components/todo/quick-add";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import { DeleteListButton } from "@/components/lists/delete-list-button";
import { NotesEditor } from "@/components/shared/notes-editor";
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
  const [todos, tags, lists, activity, notes, t] = await Promise.all([
    getGroupTodos(groupId, filters),
    getUserTags(),
    getGroupLists(groupId),
    getGroupActivity(groupId),
    getGroupNotes(groupId),
    getDictionary(),
  ]);

  const currentMember = group.members.find((m) => m.user_id === session.userId);
  const isAdmin = currentMember?.role === "admin";
  const joinRequests = isAdmin ? await getGroupJoinRequests(groupId) : [];

  const unlistedTodos = todos.filter((t) => !t.list_id);
  const todosByListId = new Map(lists.map((l) => [l.id, todos.filter((t) => t.list_id === l.id)]));

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-xl font-semibold">{group.name}</h1>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.members"]}</h2>
        <MemberList
          groupId={groupId}
          members={group.members}
          currentUserId={session.userId}
          isAdmin={isAdmin}
        />
      </div>

      {isAdmin && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.inviteLink"]}</h2>
          <InviteLink token={group.invite_token} />
        </div>
      )}

      {isAdmin && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.joinRequests"]}</h2>
          <JoinRequests
            requests={joinRequests}
            onApprove={approveGroupJoinRequest}
            onDecline={declineGroupJoinRequest}
          />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.notes"]}</h2>
        <NotesEditor initialContent={notes} onSave={saveGroupNotes.bind(null, groupId)} />
      </div>

      <TodoFilterBar basePath={`/groups/${groupId}`} tags={tags} />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.todos"]}</h2>
        <QuickAdd
          tags={tags}
          members={group.members.map((m) => ({ user_id: m.user_id, display_name: m.display_name }))}
          groupId={groupId}
        />
        <NewTodo groupId={groupId} />
        <TodoList
          todos={unlistedTodos}
          allTags={tags}
          groupMembers={group.members}
          currentUserId={session.userId}
          emptyMessage={t["groups.noUnlistedTodos"]}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["nav.lists"]}</h2>
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
              currentUserId={session.userId}
              emptyMessage={t["shared.noListTodos"]}
            />
          </div>
        ))}
        <form action={createGroupList.bind(null, groupId)} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[160px] flex-1">
            <Label htmlFor="listName">{t["list.new"]}</Label>
            <Input id="listName" name="name" required placeholder={t["list.namePlaceholderGroup"]} />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            {t["common.create"]}
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["activity.title"]}</h2>
        <ActivityFeed entries={activity} />
      </div>

      {isAdmin && (
        <div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-red-600 dark:text-red-400">{t["shared.dangerZone"]}</h2>
          <DeleteGroupButton groupId={groupId} groupName={group.name} />
        </div>
      )}
    </div>
  );
}
