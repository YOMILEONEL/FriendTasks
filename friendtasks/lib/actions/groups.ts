"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { GroupNameSchema } from "@/lib/validation/groups";

export async function createGroup(formData: FormData) {
  const session = await verifySession();

  const validated = GroupNameSchema.safeParse({ name: formData.get("name") });
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const supabase = await createClient();

  // Choosing the id ourselves (instead of insert().select()) sidesteps a
  // Postgres RLS quirk: on INSERT ... RETURNING, the returned row is also
  // checked against the SELECT policy (groups_select_member, which needs a
  // group_members row). The handle_new_group trigger only creates that
  // membership row after the insert, so relying on RETURNING here raised
  // "new row violates row-level security policy" even though the insert
  // itself was allowed.
  const id = randomUUID();
  const { error } = await supabase
    .from("groups")
    .insert({ id, name: validated.data.name, created_by: session.userId });

  if (error) throw new Error(error.message);
  revalidatePath("/groups");
  redirect(`/groups/${id}`);
}

export async function deleteGroup(groupId: string) {
  await verifySession();
  const supabase = await createClient();

  // RLS (groups_delete_admin) ensures only an admin can do this. Cascades
  // through group_members and any group-scoped todos via existing FKs.
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) throw new Error(error.message);

  revalidatePath("/groups");
  redirect("/groups");
}

export async function removeMember(groupId: string, userId: string) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}`);
}

export async function leaveGroup(groupId: string) {
  const session = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", session.userId);

  if (error) throw new Error(error.message);

  revalidatePath("/groups");
  redirect("/groups");
}

export async function joinGroup(token: string) {
  await verifySession();
  const supabase = await createClient();

  // Creates a pending join request (or no-ops if already a member) — see
  // join_group_by_token. Redirecting back to the same join page lets it
  // re-fetch the preview and show "request sent" instead of assuming
  // membership, since the requester isn't actually in yet.
  const { error } = await supabase.rpc("join_group_by_token", { token });
  if (error) {
    throw new Error("Einladung ungültig oder abgelaufen.");
  }

  revalidatePath(`/groups/join/${token}`);
  redirect(`/groups/join/${token}`);
}

export async function approveGroupJoinRequest(requestId: string) {
  await verifySession();
  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("group_join_requests")
    .select("group_id, user_id")
    .eq("id", requestId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: request.group_id, user_id: request.user_id, role: "member" });
  if (memberError) throw new Error(memberError.message);

  // Triggers the "join_approved" notification to the requester.
  const { error: statusError } = await supabase
    .from("group_join_requests")
    .update({ status: "approved", decided_at: new Date().toISOString() })
    .eq("id", requestId);
  if (statusError) throw new Error(statusError.message);

  revalidatePath(`/groups/${request.group_id}`);
}

export async function declineGroupJoinRequest(requestId: string) {
  await verifySession();
  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("group_join_requests")
    .select("group_id")
    .eq("id", requestId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("group_join_requests")
    .update({ status: "declined", decided_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw new Error(error.message);

  revalidatePath(`/groups/${request.group_id}`);
}
