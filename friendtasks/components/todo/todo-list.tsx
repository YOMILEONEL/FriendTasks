import { TodoItem } from "@/components/todo/todo-item";
import type { Tag, TodoWithRelations } from "@/lib/types/todo";
import type { GroupMember } from "@/lib/types/group";

export function TodoList({
  todos,
  allTags,
  groupMembers,
  currentUserId,
  emptyMessage,
}: {
  todos: TodoWithRelations[];
  allTags: Tag[];
  groupMembers?: GroupMember[];
  // Needed so each row can tell whether *this* todo is a personal list's
  // todo the viewer doesn't own (read-only) — see TodoItem.
  currentUserId: string;
  emptyMessage: string;
}) {
  if (todos.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        // A multi-weekday recurring todo can appear more than once in the
        // same list (one row per projected occurrence), all sharing the
        // same real todo.id — due_date disambiguates the React key.
        <TodoItem
          key={`${todo.id}-${todo.due_date ?? "none"}`}
          todo={todo}
          allTags={allTags}
          groupMembers={groupMembers}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}
