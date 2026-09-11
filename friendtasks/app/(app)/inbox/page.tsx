import { getInboxTodos, getUserTags } from "@/lib/data/todos";
import { getDictionary } from "@/lib/i18n/server";
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
  const [todos, tags, t] = await Promise.all([getInboxTodos(filters), getUserTags(), getDictionary()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t["nav.inbox"]}</h1>
      <NewTodo />
      <TodoFilterBar basePath="/inbox" tags={tags} />
      <TodoList todos={todos} allTags={tags} emptyMessage={t["page.inbox.empty"]} />
    </div>
  );
}
