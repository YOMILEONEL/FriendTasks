import type { Database } from "@/lib/types/database";

export type Todo = Database["public"]["Tables"]["todos"]["Row"];
export type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];

export interface Assignee {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface TodoWithRelations extends Todo {
  subtasks: Subtask[];
  tags: Tag[];
  assignees: Assignee[];
  // Populated whenever personal and group todos are mixed together in one
  // list (getWeekTodos, getAllTodos) and need to be told apart visually.
  group_name: string | null;
}

export interface TodoFilters {
  status?: "open" | "done" | "all";
  priority?: "low" | "medium" | "high" | "all";
  tagId?: string;
  sort?: "due_date" | "priority" | "created_at";
  q?: string;
}
