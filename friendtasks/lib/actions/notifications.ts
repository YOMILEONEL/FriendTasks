"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";

export async function markNotificationRead(notificationId: string) {
  const session = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", session.userId);

  if (error) throw new Error(error.message);
}

export async function markNotificationsRead(notificationIds: string[]) {
  const session = await verifySession();
  if (notificationIds.length === 0) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", notificationIds)
    .eq("user_id", session.userId);

  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead() {
  const session = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", session.userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
}
