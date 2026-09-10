import { getInboxTodos, getUserTags } from "@/lib/data/todos";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import type { TodoFilters } from "@/lib/types/todo";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; tagId?: string; q?: string }>;
}) {
  const filters = (await searchParams) as TodoFilters;
  const [todos, tags] = await Promise.all([getInboxTodos(filters), getUserTags()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ohne Datum</h1>
      <NewTodo />
      <TodoFilterBar basePath="/inbox" tags={tags} />
      <TodoList todos={todos} allTags={tags} emptyMessage="Keine Todos ohne Fälligkeitsdatum." />
    </div>
  );
}
