import type { Database } from "@/lib/types/database";

export type List = Database["public"]["Tables"]["lists"]["Row"];

export interface ListMember {
  user_id: string;
  joined_at: string;
  display_name: string;
  avatar_url: string | null;
  color: string;
}

export interface ListWithMembers extends List {
  members: ListMember[];
}

export interface ListPreview {
  id: string;
  name: string;
  member_count: number;
}
