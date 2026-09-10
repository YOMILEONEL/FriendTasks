import { getAllTodos, getUserTags } from "@/lib/data/todos";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";
import { FilterBar } from "@/components/todo/filter-bar";
import type { TodoFilters } from "@/lib/types/todo";

export default async function AllTodosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; sort?: string; tagId?: string }>;
}) {
  const params = await searchParams;
  const filters: TodoFilters = {
    status: params.status as TodoFilters["status"],
    priority: params.priority as TodoFilters["priority"],
    sort: params.sort as TodoFilters["sort"],
    tagId: params.tagId,
  };

  const [todos, tags] = await Promise.all([getAllTodos(filters), getUserTags()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Alle Todos</h1>
      <NewTodo />
      <FilterBar tags={tags} />
      <TodoList todos={todos} allTags={tags} emptyMessage="Keine Todos gefunden." />
    </div>
  );
}
