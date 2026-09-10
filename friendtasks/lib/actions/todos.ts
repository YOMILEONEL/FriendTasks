"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { nextRecurrenceDate } from "@/lib/utils/date";
import { SubtaskInputSchema, TodoInputSchema } from "@/lib/validation/todo";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

function revalidateTodoViews() {
  for (const path of ["/today", "/upcoming", "/inbox", "/all", "/dashboard", "/calendar"]) {
    revalidatePath(path);
  }
  revalidatePath("/groups", "layout");
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

// Creates the next occurrence of a recurring todo once the current one is
// marked done — no background job, the series just advances one step at a
// time on completion (same model Todoist uses for recurring tasks). Copies
// tags and assignees so the new occurrence looks the same as the old one;
// subtasks are deliberately not copied, a fresh checklist per occurrence.
// Best-effort: a failure here shouldn't block the user from completing their
// task, so errors are swallowed rather than thrown.
async function createNextRecurrence(supabase: SupabaseClient<Database>, todoId: string) {
  try {
    const { data: todo } = await supabase
      .from("todos")
      .select(
        "title, description, due_date, due_time, due_time_end, priority, recurrence, owner_id, group_id"
      )
      .eq("id", todoId)
      .single();

    if (!todo?.recurrence || !todo.due_date) return;

    const nextId = randomUUID();
    const { error: insertError } = await supabase.from("todos").insert({
      id: nextId,
      title: todo.title,
      description: todo.description,
      due_date: nextRecurrenceDate(todo.due_date, todo.recurrence),
      due_time: todo.due_time,
      due_time_end: todo.due_time_end,
      priority: todo.priority,
      recurrence: todo.recurrence,
      owner_id: todo.owner_id,
      group_id: todo.group_id,
    });
    if (insertError) return;

    const { data: tagLinks } = await supabase.from("todo_tags").select("tag_id").eq("todo_id", todoId);
    if (tagLinks && tagLinks.length > 0) {
      await supabase
        .from("todo_tags")
        .insert(tagLinks.map((t) => ({ todo_id: nextId, tag_id: t.tag_id })));
    }

    const { data: assigneeLinks } = await supabase
      .from("todo_assignees")
      .select("user_id")
      .eq("todo_id", todoId);
    if (assigneeLinks && assigneeLinks.length > 0) {
      await supabase
        .from("todo_assignees")
        .insert(assigneeLinks.map((a) => ({ todo_id: nextId, user_id: a.user_id })));
    }
  } catch {
    // Best-effort, see comment above.
  }
}

export async function toggleTodoStatus(todoId: string, done: boolean) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("todos")
    .update({ status: done ? "done" : "open" })
    .eq("id", todoId);

  if (error) throw new Error(error.message);

  if (done) {
    await createNextRecurrence(supabase, todoId);
  }

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
