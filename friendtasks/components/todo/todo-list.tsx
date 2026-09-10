import { TodoItem } from "@/components/todo/todo-item";
import type { Tag, TodoWithRelations } from "@/lib/types/todo";
import type { GroupMember } from "@/lib/types/group";

export function TodoList({
  todos,
  allTags,
  groupMembers,
  emptyMessage,
}: {
  todos: TodoWithRelations[];
  allTags: Tag[];
  groupMembers?: GroupMember[];
  emptyMessage: string;
}) {
  if (todos.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} allTags={allTags} groupMembers={groupMembers} />
      ))}
    </ul>
  );
}
