import { TodoItem } from "@/components/todo/todo-item";
import type { Tag, TodoWithRelations } from "@/lib/types/todo";

export function TodoList({
  todos,
  allTags,
  emptyMessage,
}: {
  todos: TodoWithRelations[];
  allTags: Tag[];
  emptyMessage: string;
}) {
  if (todos.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} allTags={allTags} />
      ))}
    </ul>
  );
}
