import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";

export interface NotificationView {
  id: string;
  type: "assigned" | "comment";
  message: string | null;
  actor_name: string;
  group_id: string | null;
  list_id: string | null;
  is_read: boolean;
  created_at: string;
  // Same (type, todo_id) pair repeated across unread rows collapses into one
  // bundled line in the UI (FR-34), e.g. "3 neue Kommentare zu 'Einkaufen'".
  todo_id: string | null;
}

export async function getNotifications(limit = 30): Promise<NotificationView[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, message, todo_id, group_id, list_id, is_read, created_at, profiles!notifications_actor_id_fkey(display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    message: row.message,
    actor_name: row.profiles?.display_name ?? "Jemand",
    group_id: row.group_id,
    list_id: row.list_id,
    is_read: row.is_read,
    created_at: row.created_at,
    todo_id: row.todo_id,
  }));
}
