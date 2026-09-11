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

  // Creates a pending join request (or no-ops if already a member/owner) —
  // see join_list_by_token. Redirecting back to the same join page lets it
  // re-fetch the preview and show "request sent" instead of assuming
  // membership, since the requester isn't actually in yet.
  const { error } = await supabase.rpc("join_list_by_token", { token });
  if (error) {
    throw new Error("Einladung ungültig oder abgelaufen.");
  }

  revalidatePath(`/lists/join/${token}`);
  redirect(`/lists/join/${token}`);
}

export async function approveListJoinRequest(requestId: string) {
  await verifySession();
  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("list_join_requests")
    .select("list_id, user_id")
    .eq("id", requestId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error: memberError } = await supabase
    .from("list_members")
    .insert({ list_id: request.list_id, user_id: request.user_id });
  if (memberError) throw new Error(memberError.message);

  // Triggers the "join_approved" notification to the requester.
  const { error: statusError } = await supabase
    .from("list_join_requests")
    .update({ status: "approved", decided_at: new Date().toISOString() })
    .eq("id", requestId);
  if (statusError) throw new Error(statusError.message);

  revalidatePath(`/lists/${request.list_id}`);
}

export async function declineListJoinRequest(requestId: string) {
  await verifySession();
  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("list_join_requests")
    .select("list_id")
    .eq("id", requestId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("list_join_requests")
    .update({ status: "declined", decided_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw new Error(error.message);

  revalidatePath(`/lists/${request.list_id}`);
}
