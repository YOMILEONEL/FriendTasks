"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/data/dal";

export interface CommentView {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  is_own: boolean;
}

export async function listComments(todoId: string): Promise<CommentView[]> {
  const session = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("todo_comments")
    .select("id, content, created_at, author_id, profiles(display_name)")
    .eq("todo_id", todoId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    author_name: row.profiles?.display_name ?? "Unbekannt",
    is_own: row.author_id === session.userId,
  }));
}

export async function createComment(todoId: string, content: string) {
  const session = await verifySession();
  const trimmed = content.trim().slice(0, 2000);
  if (!trimmed) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("todo_comments")
    .insert({ todo_id: todoId, author_id: session.userId, content: trimmed });

  if (error) throw new Error(error.message);
}

export async function deleteComment(commentId: string) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("todo_comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
}
