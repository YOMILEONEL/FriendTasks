"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { SubtaskInputSchema, TodoInputSchema } from "@/lib/validation/todo";

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
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const { title, description, dueDate, dueTime, dueTimeEnd, priority } = validated.data;
  const groupId = formData.get("groupId");
  const supabase = await createClient();

  const { error } = await supabase.from("todos").insert({
    title,
    description: description || null,
    due_date: dueDate || null,
    due_time: dueTime || null,
    due_time_end: dueTimeEnd || null,
    priority,
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
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const { title, description, dueDate, dueTime, dueTimeEnd, priority } = validated.data;
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
