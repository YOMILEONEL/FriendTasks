"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";

export async function saveGroupNotes(groupId: string, formData: FormData) {
  await verifySession();
  const content = String(formData.get("content") ?? "").slice(0, 10000);
  const supabase = await createClient();

  const { error } = await supabase
    .from("group_notes")
    .upsert({ group_id: groupId, content }, { onConflict: "group_id" });

  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}`);
}

export async function saveListNotes(listId: string, formData: FormData) {
  await verifySession();
  const content = String(formData.get("content") ?? "").slice(0, 10000);
  const supabase = await createClient();

  const { error } = await supabase
    .from("list_notes")
    .upsert({ list_id: listId, content }, { onConflict: "list_id" });

  if (error) throw new Error(error.message);
  revalidatePath(`/lists/${listId}`);
}
