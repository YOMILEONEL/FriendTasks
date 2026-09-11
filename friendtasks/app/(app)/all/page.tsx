import { verifySession } from "@/lib/data/dal";
import { getAllTodos, getUserTags } from "@/lib/data/todos";
import { getDictionary } from "@/lib/i18n/server";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import type { TodoFilters } from "@/lib/types/todo";

export default async function AllTodosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; sort?: string; tagId?: string; q?: string }>;
}) {
  const filters = (await searchParams) as TodoFilters;
  const [session, todos, tags, t] = await Promise.all([
    verifySession(),
    getAllTodos(filters),
    getUserTags(),
    getDictionary(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t["page.all.title"]}</h1>
      <NewTodo />
      <TodoFilterBar basePath="/all" tags={tags} showSort />
      <TodoList todos={todos} allTags={tags} currentUserId={session.userId} emptyMessage={t["page.all.empty"]} />
    </div>
  );
}
