import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { todayISO, endOfWeekISO } from "@/lib/utils/date";
import type { Subtask, Tag, Todo, TodoFilters, TodoWithRelations } from "@/lib/types/todo";

const TODO_SELECT = "*, subtasks(*), todo_tags(tags(*))";

interface TodoRow extends Todo {
  subtasks: Subtask[];
  todo_tags: { tags: Tag | null }[];
}

// The Supabase client types todo_tags(tags(*)) as an array of
// `{ tags: Tag | null }` rows; flatten that into a plain `tags: Tag[]`.
function mapTodo(row: TodoRow): TodoWithRelations {
  const { todo_tags, subtasks, ...rest } = row;
  return {
    ...rest,
    subtasks: [...subtasks].sort((a, b) => a.position - b.position),
    tags: todo_tags.map((tt) => tt.tags).filter((tag): tag is Tag => tag !== null),
  };
}

export async function getTodayTodos(): Promise<TodoWithRelations[]> {
  const session = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("todos")
    .select(TODO_SELECT)
    .eq("owner_id", session.userId)
    .eq("due_date", todayISO())
    .order("priority", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTodo);
}

export async function getUpcomingTodos(): Promise<TodoWithRelations[]> {
  const session = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("todos")
    .select(TODO_SELECT)
    .eq("owner_id", session.userId)
    .gt("due_date", todayISO())
    .lte("due_date", endOfWeekISO())
    .order("due_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTodo);
}

export async function getInboxTodos(): Promise<TodoWithRelations[]> {
  const session = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("todos")
    .select(TODO_SELECT)
    .eq("owner_id", session.userId)
    .is("due_date", null)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTodo);
}

export async function getAllTodos(filters: TodoFilters = {}): Promise<TodoWithRelations[]> {
  const session = await verifySession();
  const supabase = await createClient();

  let query = supabase.from("todos").select(TODO_SELECT).eq("owner_id", session.userId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  const sortColumn = filters.sort ?? "created_at";
  query = query.order(sortColumn, {
    ascending: sortColumn === "due_date" || sortColumn === "priority",
    nullsFirst: false,
  });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let todos = (data ?? []).map(mapTodo);

  if (filters.tagId) {
    todos = todos.filter((todo) => todo.tags.some((tag) => tag.id === filters.tagId));
  }

  return todos;
}

export async function getUserTags() {
  const session = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("owner_id", session.userId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
