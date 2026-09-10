"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";
import { TagInputSchema } from "@/lib/validation/todo";

export async function createTag(formData: FormData) {
  const session = await verifySession();

  const validated = TagInputSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({
    owner_id: session.userId,
    name: validated.data.name,
    color: validated.data.color,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/all");
}

export async function deleteTag(tagId: string) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) throw new Error(error.message);
  revalidatePath("/all");
}
