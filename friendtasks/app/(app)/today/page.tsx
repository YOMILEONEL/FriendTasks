import { getTodayTodos, getUserTags } from "@/lib/data/todos";
import { NewTodo } from "@/components/todo/new-todo";
import { TodoList } from "@/components/todo/todo-list";

export default async function TodayPage() {
  const [todos, tags] = await Promise.all([getTodayTodos(), getUserTags()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Heute</h1>
      <NewTodo />
      <TodoList todos={todos} allTags={tags} emptyMessage="Für heute steht nichts an." />
    </div>
  );
}
