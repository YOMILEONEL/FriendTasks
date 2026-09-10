import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { addMinutesClamped, endOfWeekISO, getWeekDays, nowTimeISO, todayISO } from "@/lib/utils/date";
import type { Assignee, Subtask, Tag, Todo, TodoFilters, TodoWithRelations } from "@/lib/types/todo";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

const TODO_SELECT = "*, subtasks(*), todo_tags(tags(*))";

interface TodoRow extends Todo {
  subtasks: Subtask[];
  todo_tags: { tags: Tag | null }[];
}

// The Supabase client types todo_tags(tags(*)) as an array of
// `{ tags: Tag | null }` rows; flatten that into a plain `tags: Tag[]`.
// `assignees` and `group_name` start empty/null here and are filled in
// afterwards where relevant (getGroupTodos populates assignees;
// withGroupNames populates group_name for the mixed personal+group views).
function mapTodo(row: TodoRow): TodoWithRelations {
  const { todo_tags, subtasks, ...rest } = row;
  return {
    ...rest,
    subtasks: [...subtasks].sort((a, b) => a.position - b.position),
    tags: todo_tags.map((tt) => tt.tags).filter((tag): tag is Tag => tag !== null),
    assignees: [],
    group_name: null,
  };
}

// Adding Relationships metadata elsewhere in Database (for group_members/
// todo_assignees -> profiles embeds) pushes Supabase's automatic embed-type
// inference for this unrelated todos query past what it can resolve,
// collapsing it to `SelectQueryError`. The select string and TodoRow above
// are kept in sync by hand, so bridge the two with an explicit cast instead
// of fighting the inference.
function toTodoRows(data: unknown): TodoRow[] {
  return (data ?? []) as TodoRow[];
}

// Client-side filtering for tag + free-text search: tags come from a
// separate join table (already flattened onto `tags` by mapTodo), and a
// simple case-insensitive substring match on the title is enough here given
// the small scale this app runs at — no need for a dedicated search index.
function applyPostFilters(todos: TodoWithRelations[], filters: TodoFilters): TodoWithRelations[] {
  let result = todos;
  if (filters.tagId) {
    result = result.filter((todo) => todo.tags.some((tag) => tag.id === filters.tagId));
  }
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    if (q) result = result.filter((todo) => todo.title.toLowerCase().includes(q));
  }
  return result;
}

// Looks up group names for whatever group_ids appear in `todos` and returns
// a copy with `group_name` filled in — used wherever personal and group
// todos are mixed together in one list.
async function withGroupNames(
  supabase: SupabaseClient<Database>,
  todos: TodoWithRelations[]
): Promise<TodoWithRelations[]> {
  const groupIds = [...new Set(todos.map((t) => t.group_id).filter((id): id is string => id !== null))];
  if (groupIds.length === 0) return todos;

  const { data: groups, error } = await supabase.from("groups").select("id, name").in("id", groupIds);
  if (error) throw new Error(error.message);

  const nameByGroupId = new Map((groups ?? []).map((g) => [g.id, g.name]));
  return todos.map((todo) => ({
    ...todo,
    group_name: todo.group_id ? (nameByGroupId.get(todo.group_id) ?? null) : null,
  }));
}

// Like getAllTodos below: not filtered to the caller's own todos, so a
// group todo due today shows up here too (RLS still scopes this to todos
// the caller can actually see). group_name lets the UI tell them apart.
export async function getTodayTodos(filters: TodoFilters = {}): Promise<TodoWithRelations[]> {
  await verifySession();
  const supabase = await createClient();

  let query = supabase.from("todos").select(TODO_SELECT).eq("due_date", todayISO());

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);

  const { data, error } = await query.order("priority", { ascending: false });

  if (error) throw new Error(error.message);
  const todos = await withGroupNames(supabase, toTodoRows(data).map(mapTodo));
  return applyPostFilters(todos, filters);
}

// Covers the whole week including today (not just the days after it), so a
// todo due today appears both here and on "Heute" — that overlap is
// intentional, "Diese Woche" is meant to show everything due this week.
export async function getUpcomingTodos(filters: TodoFilters = {}): Promise<TodoWithRelations[]> {
  await verifySession();
  const supabase = await createClient();

  let query = supabase
    .from("todos")
    .select(TODO_SELECT)
    .gte("due_date", todayISO())
    .lte("due_date", endOfWeekISO());

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);

  const { data, error } = await query.order("due_date", { ascending: true });

  if (error) throw new Error(error.message);
  const todos = await withGroupNames(supabase, toTodoRows(data).map(mapTodo));
  return applyPostFilters(todos, filters);
}

export async function getInboxTodos(filters: TodoFilters = {}): Promise<TodoWithRelations[]> {
  await verifySession();
  const supabase = await createClient();

  let query = supabase.from("todos").select(TODO_SELECT).is("due_date", null);

  // Inbox defaults to open-only (its whole point is "still needs doing"),
  // but an explicit filter choice overrides that default.
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  } else if (!filters.status) {
    query = query.eq("status", "open");
  }
  if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const todos = await withGroupNames(supabase, toTodoRows(data).map(mapTodo));
  return applyPostFilters(todos, filters);
}

// Deliberately not filtered to the caller's own todos: RLS (todos_select)
// already limits rows to "owner_id = auth.uid() OR member of the group",
// so this returns personal todos plus everything happening in the caller's
// groups. group_name is filled in so the UI can tell them apart.
export async function getAllTodos(filters: TodoFilters = {}): Promise<TodoWithRelations[]> {
  await verifySession();
  const supabase = await createClient();

  let query = supabase.from("todos").select(TODO_SELECT);

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

  const todos = await withGroupNames(supabase, toTodoRows(data).map(mapTodo));
  return applyPostFilters(todos, filters);
}

export async function getWeekTodos(mondayISO: string): Promise<TodoWithRelations[]> {
  await verifySession();
  const supabase = await createClient();
  const days = getWeekDays(mondayISO);

  const { data, error } = await supabase
    .from("todos")
    .select(TODO_SELECT)
    .gte("due_date", days[0])
    .lte("due_date", days[6])
    .order("due_time", { ascending: true, nullsFirst: true });

  if (error) throw new Error(error.message);
  return withGroupNames(supabase, toTodoRows(data).map(mapTodo));
}

export interface TodoAlerts {
  overdue: TodoWithRelations[];
  dueSoon: TodoWithRelations[];
}

// For the dashboard's "attention needed" banner: open todos that are either
// already overdue (past days, or today with a due_time earlier than now) or
// due within the next hour. Date-only todos due today aren't classified
// either way — without a time, "today" isn't overdue until the day is over.
export async function getTodoAlerts(): Promise<TodoAlerts> {
  await verifySession();
  const supabase = await createClient();

  const today = todayISO();
  const { data, error } = await supabase
    .from("todos")
    .select(TODO_SELECT)
    .eq("status", "open")
    .lte("due_date", today);

  if (error) throw new Error(error.message);
  const todos = await withGroupNames(supabase, toTodoRows(data).map(mapTodo));

  const now = nowTimeISO();
  const soonLimit = addMinutesClamped(now, 60);

  const overdue: TodoWithRelations[] = [];
  const dueSoon: TodoWithRelations[] = [];

  for (const todo of todos) {
    if (!todo.due_date) continue;
    if (todo.due_date < today) {
      overdue.push(todo);
      continue;
    }
    if (!todo.due_time) continue;
    const time = todo.due_time.slice(0, 5);
    if (time < now) {
      overdue.push(todo);
    } else if (time <= soonLimit) {
      dueSoon.push(todo);
    }
  }

  return { overdue, dueSoon };
}

export async function getGroupTodos(
  groupId: string,
  filters: TodoFilters = {}
): Promise<TodoWithRelations[]> {
  await verifySession();
  const supabase = await createClient();

  let query = supabase.from("todos").select(TODO_SELECT).eq("group_id", groupId);

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const todos = applyPostFilters(toTodoRows(data).map(mapTodo), filters);
  if (todos.length === 0) return todos;

  const { data: assigneeRows, error: assigneeError } = await supabase
    .from("todo_assignees")
    .select("todo_id, user_id, profiles(display_name, avatar_url)")
    .in(
      "todo_id",
      todos.map((t) => t.id)
    );

  if (assigneeError) throw new Error(assigneeError.message);

  const assigneesByTodoId = new Map<string, Assignee[]>();
  for (const row of assigneeRows ?? []) {
    if (!row.profiles) continue;
    const list = assigneesByTodoId.get(row.todo_id) ?? [];
    list.push({
      user_id: row.user_id,
      display_name: row.profiles.display_name,
      avatar_url: row.profiles.avatar_url,
    });
    assigneesByTodoId.set(row.todo_id, list);
  }

  return todos.map((todo) => ({ ...todo, assignees: assigneesByTodoId.get(todo.id) ?? [] }));
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
