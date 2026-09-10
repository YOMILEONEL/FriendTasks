import type { Database } from "@/lib/types/database";

export type Todo = Database["public"]["Tables"]["todos"]["Row"];
export type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];

export interface TodoWithRelations extends Todo {
  subtasks: Subtask[];
  tags: Tag[];
}

export interface TodoFilters {
  status?: "open" | "done" | "all";
  priority?: "low" | "medium" | "high" | "all";
  tagId?: string;
  sort?: "due_date" | "priority" | "created_at";
}
