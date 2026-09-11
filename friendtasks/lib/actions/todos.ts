"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { nextRecurrenceDate } from "@/lib/utils/date";
import { revalidateTodoViews } from "@/lib/utils/revalidate";
import { SubtaskInputSchema, TodoInputSchema } from "@/lib/validation/todo";

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
    recurrenceUntil: formData.get("recurrenceUntil") ?? "",
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const { title, description, dueDate, dueTime, dueTimeEnd, priority, recurrence, recurrenceUntil } =
    validated.data;
  const groupId = formData.get("groupId");
  const listId = formData.get("listId");
  const claimable = formData.get("claimable") === "on";
  const supabase = await createClient();

  const { error } = await supabase.from("todos").insert({
    title,
    description: description || null,
    due_date: dueDate || null,
    due_time: dueTime || null,
    due_time_end: dueTimeEnd || null,
    priority,
    recurrence: recurrence === "none" ? null : recurrence,
    recurrence_until: recurrenceUntil || null,
    owner_id: session.userId,
    group_id: typeof groupId === "string" && groupId ? groupId : null,
    list_id: typeof listId === "string" && listId ? listId : null,
    claimable: typeof groupId === "string" && groupId ? claimable : false,
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
    recurrenceUntil: formData.get("recurrenceUntil") ?? "",
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const { title, description, dueDate, dueTime, dueTimeEnd, priority, recurrence, recurrenceUntil } =
    validated.data;
  const claimable = formData.get("claimable") === "on";
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
      recurrence_until: recurrenceUntil || null,
      claimable,
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

// `occurrenceDate` identifies which occurrence of a recurring todo is being
// toggled — the calendar and Heute/Diese Woche can show either the row's
// real due_date or a projected future date (see getProjectedRecurringTodos),
// and callers just pass along whatever due_date they're currently rendering.
// For a non-recurring todo it's ignored.
export async function toggleTodoStatus(todoId: string, done: boolean, occurrenceDate?: string) {
  await verifySession();
  const supabase = await createClient();

  if (done) {
    const { data: todo } = await supabase
      .from("todos")
      .select("due_date, recurrence, recurrence_until")
      .eq("id", todoId)
      .single();

    if (todo?.recurrence && todo.due_date) {
      const targetDate = occurrenceDate ?? todo.due_date;
      const next = nextRecurrenceDate(targetDate, todo.recurrence);
      const seriesEnds = !!todo.recurrence_until && next > todo.recurrence_until;

      if (seriesEnds) {
        // Last occurrence of the series: the row itself becomes the
        // permanent "done" marker for that date, same as a one-off todo.
        const { error } = await supabase
          .from("todos")
          .update({ due_date: targetDate, status: "done" })
          .eq("id", todoId);
        if (error) throw new Error(error.message);
        revalidateTodoViews();
        return;
      }

      // The row advances to the next occurrence and reopens, so it no
      // longer sits on `targetDate` — record that this occurrence was
      // completed so the calendar can still show it there, struck through.
      const { error: completionError } = await supabase
        .from("todo_occurrence_completions")
        .upsert({ todo_id: todoId, occurrence_date: targetDate }, { onConflict: "todo_id,occurrence_date" });
      if (completionError) throw new Error(completionError.message);

      const { error } = await supabase
        .from("todos")
        .update({ due_date: next, status: "open" })
        .eq("id", todoId);
      if (error) throw new Error(error.message);
      revalidateTodoViews();
      return;
    }
  } else if (occurrenceDate) {
    // Unchecking a historical completed occurrence (not the row's own
    // current due_date) just removes that log entry.
    const { data: todo } = await supabase.from("todos").select("due_date").eq("id", todoId).single();
    if (todo && occurrenceDate !== todo.due_date) {
      const { error } = await supabase
        .from("todo_occurrence_completions")
        .delete()
        .eq("todo_id", todoId)
        .eq("occurrence_date", occurrenceDate);
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

// Claims a todo marked "offen für alle" (FR-36): assigns the caller and
// clears claimable so it behaves like a normally assigned todo from here on.
export async function claimTodo(todoId: string) {
  const session = await verifySession();
  const supabase = await createClient();

  const { error: assignError } = await supabase
    .from("todo_assignees")
    .insert({ todo_id: todoId, user_id: session.userId });
  if (assignError) throw new Error(assignError.message);

  const { error } = await supabase.from("todos").update({ claimable: false }).eq("id", todoId);
  if (error) throw new Error(error.message);
  revalidateTodoViews();
}

// Duplicates a todo (FR-21): copies the reusable structure (title,
// schedule, priority, tags, subtasks with their checkmarks reset) but not
// who it's assigned to or its recurrence anchor — a fresh, unclaimed copy
// to reuse as a template.
export async function duplicateTodo(todoId: string) {
  const session = await verifySession();
  const supabase = await createClient();

  const { data: original, error: fetchError } = await supabase
    .from("todos")
    .select("title, description, due_date, due_time, due_time_end, priority, group_id, list_id")
    .eq("id", todoId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const newId = randomUUID();
  const { error: insertError } = await supabase.from("todos").insert({
    id: newId,
    title: `${original.title} (Kopie)`,
    description: original.description,
    due_date: original.due_date,
    due_time: original.due_time,
    due_time_end: original.due_time_end,
    priority: original.priority,
    owner_id: session.userId,
    group_id: original.group_id,
    list_id: original.list_id,
  });
  if (insertError) throw new Error(insertError.message);

  const { data: tagLinks } = await supabase.from("todo_tags").select("tag_id").eq("todo_id", todoId);
  if (tagLinks && tagLinks.length > 0) {
    await supabase.from("todo_tags").insert(tagLinks.map((t) => ({ todo_id: newId, tag_id: t.tag_id })));
  }

  const { data: subtasks } = await supabase
    .from("subtasks")
    .select("title, position")
    .eq("todo_id", todoId);
  if (subtasks && subtasks.length > 0) {
    await supabase
      .from("subtasks")
      .insert(subtasks.map((s) => ({ todo_id: newId, title: s.title, position: s.position })));
  }

  revalidateTodoViews();
}

// Quick-Add (FR-24): the natural-language parsing itself runs client-side
// (parseQuickAdd, which needs the tags/members already loaded on the page);
// this action just persists the already-parsed fields plus resolved
// tag/assignee ids in one insert.
export async function quickAddTodo(formData: FormData) {
  const session = await verifySession();

  const validated = TodoInputSchema.safeParse({
    title: formData.get("title"),
    description: "",
    dueDate: formData.get("dueDate"),
    dueTime: formData.get("dueTime"),
    dueTimeEnd: "",
    priority: "medium",
    recurrence: formData.get("recurrence") ?? "none",
    recurrenceUntil: "",
  });
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const { title, dueDate, dueTime, recurrence } = validated.data;
  const groupId = formData.get("groupId");
  const listId = formData.get("listId");
  const tagIds = String(formData.get("tagIds") ?? "")
    .split(",")
    .filter(Boolean);
  const assigneeUserIds = String(formData.get("assigneeUserIds") ?? "")
    .split(",")
    .filter(Boolean);

  const supabase = await createClient();
  const id = randomUUID();

  const { error } = await supabase.from("todos").insert({
    id,
    title,
    due_date: dueDate || null,
    due_time: dueTime || null,
    recurrence: recurrence === "none" ? null : recurrence,
    owner_id: session.userId,
    group_id: typeof groupId === "string" && groupId ? groupId : null,
    list_id: typeof listId === "string" && listId ? listId : null,
  });
  if (error) throw new Error(error.message);

  if (tagIds.length > 0) {
    await supabase.from("todo_tags").insert(tagIds.map((tagId) => ({ todo_id: id, tag_id: tagId })));
  }
  if (assigneeUserIds.length > 0) {
    await supabase
      .from("todo_assignees")
      .insert(assigneeUserIds.map((userId) => ({ todo_id: id, user_id: userId })));
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
