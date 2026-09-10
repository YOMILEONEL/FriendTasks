import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";

export async function getGroupNotes(groupId: string): Promise<string> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("group_notes")
    .select("content")
    .eq("group_id", groupId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.content ?? "";
}

export async function getListNotes(listId: string): Promise<string> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("list_notes")
    .select("content")
    .eq("list_id", listId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.content ?? "";
}
