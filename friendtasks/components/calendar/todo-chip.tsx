import { formatTimeRange } from "@/lib/utils/date";
import type { Priority } from "@/lib/types/database";
import type { TodoWithRelations } from "@/lib/types/todo";

const PRIORITY_CLASSES: Record<Priority, string> = {
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function TodoChip({ todo }: { todo: TodoWithRelations }) {
  const time = formatTimeRange(todo.due_time, todo.due_time_end);

  return (
    <div
      className={`h-full w-full overflow-hidden rounded px-1.5 py-0.5 text-left text-[11px] leading-tight ${PRIORITY_CLASSES[todo.priority]} ${
        todo.status === "done" ? "line-through opacity-60" : ""
      }`}
      title={todo.title}
    >
      {time && <div className="font-medium">{time}</div>}
      <div className="truncate">
        {todo.recurrence && (
          <span title={todo.recurrence === "weekly" ? "Wiederholt sich wöchentlich" : "Wiederholt sich monatlich"}>
            ↻{" "}
          </span>
        )}
        {todo.title}
      </div>
      {(todo.group_name || todo.list_name) && (
        <div className="truncate opacity-75">{todo.group_name ?? todo.list_name}</div>
      )}
    </div>
  );
}
