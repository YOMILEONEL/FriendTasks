import { getTodayTodos, getUserTags } from "@/lib/data/todos";
import { NewTodo } from "@/components/todo/new-todo";
import { QuickAdd } from "@/components/todo/quick-add";
import { TodoList } from "@/components/todo/todo-list";
import { TodoFilterBar } from "@/components/todo/todo-filter-bar";
import type { TodoFilters } from "@/lib/types/todo";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; tagId?: string; q?: string }>;
}) {
  const filters = (await searchParams) as TodoFilters;
  const [todos, tags] = await Promise.all([getTodayTodos(filters), getUserTags()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Heute</h1>
      <QuickAdd tags={tags} />
      <NewTodo />
      <TodoFilterBar basePath="/today" tags={tags} />
      <TodoList todos={todos} allTags={tags} emptyMessage="Für heute steht nichts an." />
    </div>
  );
}
