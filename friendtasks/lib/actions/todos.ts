"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { nextRecurrenceDate } from "@/lib/utils/date";
import { SubtaskInputSchema, TodoInputSchema } from "@/lib/validation/todo";

function revalidateTodoViews() {
  for (const path of ["/today", "/upcoming", "/inbox", "/all", "/dashboard", "/calendar"]) {
    revalidatePath(path);
  }
  revalidatePath("/groups", "layout");
}

// Returns the titles of todos visible to the current user (own + group
// todos, via RLS) that overlap the given time range on the given day — used
// to warn, not to block, so this only reports overlaps rather than
// rejecting them. Done todos don't count: a finished task doesn't occupy
// the slot anymore. A todo without an end time is treated as occupying a
// single instant, so two todos at the exact same start time still count
// as overlapping.
export async function checkTodoOverlap({
  dueDate,
  dueTime,
  dueTimeEnd,
  excludeTodoId,
}: {
  dueDate: string;
  dueTime: string;
  dueTimeEnd?: string;
  excludeTodoId?: string;
}): Promise<string[]> {
  await verifySession();
  if (!dueDate || !dueTime) return [];
  const supabase = await createClient();

  let query = supabase
    .from("todos")
    .select("id, title, due_time, due_time_end")
    .eq("due_date", dueDate)
    .eq("status", "open")
    .not("due_time", "is", null);

  if (excludeTodoId) query = query.neq("id", excludeTodoId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const start = dueTime.slice(0, 5);
  const end = (dueTimeEnd || dueTime).slice(0, 5);

  return (data ?? [])
    .filter((row) => {
      if (!row.due_time) return false;
      const otherStart = row.due_time.slice(0, 5);
      const otherEnd = (row.due_time_end ?? row.due_time).slice(0, 5);
      return start <= otherEnd && otherStart <= end;
    })
    .map((row) => row.title);
}

export async function createTodo(formData: FormData) {
  const session = await verifySession();

  const validated = TodoInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    dueTime: formData.get("dueTime"),
    dueTimeEnd: formData.get("dueTimeEnd"),
    priority: formData.get("priority") ?? "medium",
    recurrence: formData.get("recurrence") ?? "none",
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const { title, description, dueDate, dueTime, dueTimeEnd, priority, recurrence } = validated.data;
  const groupId = formData.get("groupId");
  const supabase = await createClient();

  const { error } = await supabase.from("todos").insert({
    title,
    description: description || null,
    due_date: dueDate || null,
    due_time: dueTime || null,
    due_time_end: dueTimeEnd || null,
    priority,
    recurrence: recurrence === "none" ? null : recurrence,
    owner_id: session.userId,
    group_id: typeof groupId === "string" && groupId ? groupId : null,
  });

  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

export async function updateTodo(todoId: string, formData: FormData) {
  await verifySession();

  const validated = TodoInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    dueTime: formData.get("dueTime"),
    dueTimeEnd: formData.get("dueTimeEnd"),
    priority: formData.get("priority") ?? "medium",
    recurrence: formData.get("recurrence") ?? "none",
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const { title, description, dueDate, dueTime, dueTimeEnd, priority, recurrence } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("todos")
    .update({
      title,
      description: description || null,
      due_date: dueDate || null,
      due_time: dueTime || null,
      due_time_end: dueTimeEnd || null,
      priority,
      recurrence: recurrence === "none" ? null : recurrence,
    })
    .eq("id", todoId);

  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

export async function deleteTodo(todoId: string) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("todos").delete().eq("id", todoId);
  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

export async function toggleTodoStatus(todoId: string, done: boolean) {
  await verifySession();
  const supabase = await createClient();

  // Completing a recurring todo advances the same row to its next
  // occurrence instead of creating a copy — the todo shows up on every
  // future week/month in the calendar already (see getProjectedRecurringTodos
  // in lib/data/todos.ts), so finishing it just rolls due_date forward and
  // reopens it rather than archiving it as done.
  if (done) {
    const { data: todo } = await supabase
      .from("todos")
      .select("due_date, recurrence")
      .eq("id", todoId)
      .single();

    if (todo?.recurrence && todo.due_date) {
      const { error } = await supabase
        .from("todos")
        .update({ due_date: nextRecurrenceDate(todo.due_date, todo.recurrence), status: "open" })
        .eq("id", todoId);

      if (error) throw new Error(error.message);
      revalidateTodoViews();
      return;
    }
  }

  const { error } = await supabase
    .from("todos")
    .update({ status: done ? "done" : "open" })
    .eq("id", todoId);

  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

export async function createSubtask(formData: FormData) {
  await verifySession();

  const validated = SubtaskInputSchema.safeParse({
    todoId: formData.get("todoId"),
    title: formData.get("title"),
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subtasks").insert({
    todo_id: validated.data.todoId,
    title: validated.data.title,
  });

  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

export async function toggleSubtask(subtaskId: string, done: boolean) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("subtasks")
    .update({ is_done: done })
    .eq("id", subtaskId);

  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

export async function deleteSubtask(subtaskId: string) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("subtasks").delete().eq("id", subtaskId);
  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

export async function setTodoTags(todoId: string, tagIds: string[]) {
  await verifySession();
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("todo_tags")
    .delete()
    .eq("todo_id", todoId);
  if (deleteError) throw new Error(deleteError.message);

  if (tagIds.length > 0) {
    const { error: insertError } = await supabase
      .from("todo_tags")
      .insert(tagIds.map((tagId) => ({ todo_id: todoId, tag_id: tagId })));
    if (insertError) throw new Error(insertError.message);
  }

  revalidateTodoViews();
}

export async function setTodoAssignees(todoId: string, userIds: string[]) {
  await verifySession();
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("todo_assignees")
    .delete()
    .eq("todo_id", todoId);
  if (deleteError) throw new Error(deleteError.message);

  if (userIds.length > 0) {
    const { error: insertError } = await supabase
      .from("todo_assignees")
      .insert(userIds.map((userId) => ({ todo_id: todoId, user_id: userId })));
    if (insertError) throw new Error(insertError.message);
  }

  revalidateTodoViews();
}
