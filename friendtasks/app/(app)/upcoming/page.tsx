import { verifySession } from "@/lib/data/dal";
import { getUpcomingTodos, getUserTags } from "@/lib/data/todos";
import { getDictionary } from "@/lib/i18n/server";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import type { TodoFilters } from "@/lib/types/todo";

export default async function UpcomingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; tagId?: string; q?: string }>;
}) {
  const filters = (await searchParams) as TodoFilters;
  const [session, todos, tags, t] = await Promise.all([
    verifySession(),
    getUpcomingTodos(filters),
    getUserTags(),
    getDictionary(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t["nav.upcoming"]}</h1>
      <NewTodo />
      <TodoFilterBar basePath="/upcoming" tags={tags} />
      <TodoList
        todos={todos}
        allTags={tags}
        currentUserId={session.userId}
        emptyMessage={t["page.upcoming.empty"]}
      />
    </div>
  );
}
