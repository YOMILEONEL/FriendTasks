import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import type { ActivityAction } from "@/lib/types/database";

export interface ActivityEntry {
  id: string;
  action: ActivityAction;
  detail: string | null;
  actor_name: string;
  created_at: string;
}

export async function getGroupActivity(groupId: string, limit = 20): Promise<ActivityEntry[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("id, action, detail, created_at, profiles(display_name)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    detail: row.detail,
    actor_name: row.profiles?.display_name ?? "Jemand",
    created_at: row.created_at,
  }));
}
