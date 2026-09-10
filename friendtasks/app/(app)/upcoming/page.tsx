import { getUpcomingTodos, getUserTags } from "@/lib/data/todos";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";

export default async function UpcomingPage() {
  const [todos, tags] = await Promise.all([getUpcomingTodos(), getUserTags()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Diese Woche</h1>
      <NewTodo />
      <TodoList todos={todos} allTags={tags} emptyMessage="Diese Woche ist noch nichts fällig." />
    </div>
  );
}
