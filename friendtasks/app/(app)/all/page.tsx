import { getAllTodos, getUserTags } from "@/lib/data/todos";
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
  const [todos, tags] = await Promise.all([getAllTodos(filters), getUserTags()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Alle Todos</h1>
      <NewTodo />
      <TodoFilterBar basePath="/all" tags={tags} showSort />
      <TodoList todos={todos} allTags={tags} emptyMessage="Keine Todos gefunden." />
    </div>
  );
}
