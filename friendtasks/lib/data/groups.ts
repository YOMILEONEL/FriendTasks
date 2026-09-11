import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import type { Group, GroupJoinRequest, GroupPreview, GroupWithMembers } from "@/lib/types/group";

export async function getUserGroups(): Promise<Group[]> {
  await verifySession();
  const supabase = await createClient();

  // RLS (groups_select_member) already limits this to groups the caller belongs to.
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGroup(groupId: string): Promise<GroupWithMembers | null> {
  await verifySession();
  const supabase = await createClient();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError) throw new Error(groupError.message);
  if (!group) return null;

  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("user_id, role, joined_at, profiles(display_name, avatar_url, color)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (membersError) throw new Error(membersError.message);

  return {
    ...group,
    members: (members ?? []).map((member) => ({
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
      display_name: member.profiles?.display_name ?? "Unbekannt",
      avatar_url: member.profiles?.avatar_url ?? null,
      color: member.profiles?.color ?? "#6366f1",
    })),
  };
}

export async function getGroupPreview(token: string): Promise<GroupPreview | null> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_group_preview", { token });
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

// RLS (group_join_requests_select) already limits this to admins of the
// group (or the requester's own row); the group page only fetches it for
// admins to begin with, so a regular member never even queries this.
export async function getGroupJoinRequests(groupId: string): Promise<GroupJoinRequest[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("group_join_requests")
    .select("id, user_id, status, created_at, profiles(display_name, avatar_url, color)")
    .eq("group_id", groupId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    created_at: row.created_at,
    display_name: row.profiles?.display_name ?? "Unbekannt",
    avatar_url: row.profiles?.avatar_url ?? null,
    color: row.profiles?.color ?? "#6366f1",
  }));
}
