import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import type { List, ListPreview, ListWithMembers } from "@/lib/types/list";

// Personal lists the caller owns or was invited to (RLS/lists_select already
// scopes this correctly); group_id is null filters out group sub-lists,
// which live on the group's own page instead.
export async function getUserVisibleLists(): Promise<List[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .is("group_id", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGroupLists(groupId: string): Promise<List[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getList(listId: string): Promise<ListWithMembers | null> {
  await verifySession();
  const supabase = await createClient();

  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("*")
    .eq("id", listId)
    .maybeSingle();

  if (listError) throw new Error(listError.message);
  if (!list) return null;

  const { data: memberRows, error: membersError } = await supabase
    .from("list_members")
    .select("user_id, joined_at, profiles(display_name, avatar_url, color)")
    .eq("list_id", listId)
    .order("joined_at", { ascending: true });

  if (membersError) throw new Error(membersError.message);

  const members = (memberRows ?? []).map((member) => ({
    user_id: member.user_id,
    joined_at: member.joined_at,
    display_name: member.profiles?.display_name ?? "Unbekannt",
    avatar_url: member.profiles?.avatar_url ?? null,
    color: member.profiles?.color ?? "#6366f1",
  }));

  // The owner isn't stored in list_members (only invited friends are), so
  // fetch and prepend them separately for a complete member list.
  if (list.owner_id) {
    const { data: owner } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, color")
      .eq("id", list.owner_id)
      .maybeSingle();

    members.unshift({
      user_id: list.owner_id,
      joined_at: list.created_at,
      display_name: owner?.display_name ?? "Unbekannt",
      avatar_url: owner?.avatar_url ?? null,
      color: owner?.color ?? "#6366f1",
    });
  }

  return { ...list, members };
}

export async function getListPreview(token: string): Promise<ListPreview | null> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_list_preview", { token });
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}
