import { getInboxTodos, getUserTags } from "@/lib/data/todos";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";

export default async function InboxPage() {
  const [todos, tags] = await Promise.all([getInboxTodos(), getUserTags()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ohne Datum</h1>
      <NewTodo />
      <TodoList todos={todos} allTags={tags} emptyMessage="Keine Todos ohne Fälligkeitsdatum." />
    </div>
  );
}
