import { notFound } from "next/navigation";
import { verifySession } from "@/lib/data/dal";
import { getList } from "@/lib/data/lists";
import { getListTodos, getUserTags } from "@/lib/data/todos";
import { getListNotes } from "@/lib/data/notes";
import { saveListNotes } from "@/lib/actions/notes";
import { getDictionary } from "@/lib/i18n/server";
import { ListMemberList } from "@/components/lists/list-member-list";
import { InviteLink } from "@/components/groups/invite-link";
import { NewTodo } from "@/components/todo/new-todo";
import { QuickAdd } from "@/components/todo/quick-add";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import { DeleteListButton } from "@/components/lists/delete-list-button";
import { NotesEditor } from "@/components/shared/notes-editor";
import type { TodoFilters } from "@/lib/types/todo";

export default async function ListDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ listId: string }>;
  searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
  const { listId } = await params;
  const session = await verifySession();

  const list = await getList(listId);
  if (!list || !list.owner_id) notFound();

  const filters = (await searchParams) as TodoFilters;
  const [todos, tags, notes, t] = await Promise.all([
    getListTodos(listId, filters),
    getUserTags(),
    getListNotes(listId),
    getDictionary(),
  ]);

  const isOwner = list.owner_id === session.userId;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-xl font-semibold">{list.name}</h1>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.members"]}</h2>
        <ListMemberList
          listId={listId}
          members={list.members}
          currentUserId={session.userId}
          ownerId={list.owner_id}
          isOwner={isOwner}
        />
      </div>

      {isOwner && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.inviteLink"]}</h2>
          <InviteLink token={list.invite_token} basePath="lists" />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.notes"]}</h2>
        <NotesEditor initialContent={notes} onSave={saveListNotes.bind(null, listId)} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["shared.todos"]}</h2>
        <QuickAdd
          tags={tags}
          members={list.members.map((m) => ({ user_id: m.user_id, display_name: m.display_name }))}
          listId={listId}
        />
        <NewTodo listId={listId} />
        <TodoFilterBar basePath={`/lists/${listId}`} tags={tags} />
        <TodoList todos={todos} allTags={tags} emptyMessage={t["shared.noListTodos"]} />
      </div>

      {isOwner && (
        <div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-red-600 dark:text-red-400">{t["shared.dangerZone"]}</h2>
          <DeleteListButton listId={listId} listName={list.name} redirectTo="/lists" />
        </div>
      )}
    </div>
  );
}
