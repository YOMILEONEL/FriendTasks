"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";

const BUCKET = "todo-attachments";
// Generous enough for a receipt or shopping-list photo without bloating a
// free-tier Storage quota.
const MAX_SIZE = 10 * 1024 * 1024;

export interface AttachmentView {
  id: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
  url: string | null;
}

export async function listTodoAttachments(todoId: string): Promise<AttachmentView[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("todo_attachments")
    .select("id, storage_path, file_name, file_size, created_at")
    .eq("todo_id", todoId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  return Promise.all(
    data.map(async (row) => {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_path, 60 * 60);
      return {
        id: row.id,
        file_name: row.file_name,
        file_size: row.file_size,
        created_at: row.created_at,
        url: signed?.signedUrl ?? null,
      };
    })
  );
}

export async function uploadAttachment(todoId: string, formData: FormData) {
  const session = await verifySession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Bitte eine Datei auswählen.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Datei zu groß (max. 10 MB).");
  }

  const supabase = await createClient();
  const path = `${todoId}/${randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("todo_attachments").insert({
    todo_id: todoId,
    storage_path: path,
    file_name: file.name,
    file_size: file.size,
    uploaded_by: session.userId,
  });
  if (error) throw new Error(error.message);
}

export async function deleteAttachment(attachmentId: string) {
  await verifySession();
  const supabase = await createClient();

  const { data: attachment } = await supabase
    .from("todo_attachments")
    .select("storage_path")
    .eq("id", attachmentId)
    .maybeSingle();
  if (!attachment) return;

  await supabase.storage.from(BUCKET).remove([attachment.storage_path]);
  const { error } = await supabase.from("todo_attachments").delete().eq("id", attachmentId);
  if (error) throw new Error(error.message);
}
