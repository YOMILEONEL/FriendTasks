"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { ListNameSchema } from "@/lib/validation/lists";

export async function createPersonalList(formData: FormData) {
  const session = await verifySession();

  const validated = ListNameSchema.safeParse({ name: formData.get("name") });
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const supabase = await createClient();

  // Same RLS RETURNING quirk as createGroup: choose the id ourselves and
  // skip .select() rather than relying on INSERT ... RETURNING.
  const id = randomUUID();
  const { error } = await supabase
    .from("lists")
    .insert({ id, name: validated.data.name, owner_id: session.userId });

  if (error) throw new Error(error.message);
  revalidatePath("/lists");
  redirect(`/lists/${id}`);
}

export async function createGroupList(groupId: string, formData: FormData) {
  await verifySession();

  const validated = ListNameSchema.safeParse({ name: formData.get("name") });
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("lists")
    .insert({ name: validated.data.name, group_id: groupId });

  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}`);
}

export async function deleteList(listId: string, redirectTo?: string) {
  await verifySession();
  const supabase = await createClient();

  // RLS (lists_delete) ensures only the personal-list owner or a group admin
  // can do this. Todos filed in the list aren't deleted, just unfiled
  // (todos.list_id references lists with "on delete set null").
  const { error } = await supabase.from("lists").delete().eq("id", listId);
  if (error) throw new Error(error.message);

  revalidatePath("/lists");
  revalidatePath("/groups", "layout");
  if (redirectTo) redirect(redirectTo);
}

export async function removeListMember(listId: string, userId: string) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("list_members")
    .delete()
    .eq("list_id", listId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/lists/${listId}`);
}

export async function leaveList(listId: string) {
  const session = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("list_members")
    .delete()
    .eq("list_id", listId)
    .eq("user_id", session.userId);

  if (error) throw new Error(error.message);

  revalidatePath("/lists");
  redirect("/lists");
}

export async function joinList(token: string) {
  await verifySession();
  const supabase = await createClient();

  const { data: listId, error } = await supabase.rpc("join_list_by_token", { token });
  if (error || !listId) {
    throw new Error("Einladung ungültig oder abgelaufen.");
  }

  revalidatePath("/lists");
  redirect(`/lists/${listId}`);
}
