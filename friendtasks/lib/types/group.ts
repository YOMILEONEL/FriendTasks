import type { Database, GroupRole } from "@/lib/types/database";

export type Group = Database["public"]["Tables"]["groups"]["Row"];

export interface GroupMember {
  user_id: string;
  role: GroupRole;
  joined_at: string;
  display_name: string;
  avatar_url: string | null;
  color: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface GroupPreview {
  id: string;
  name: string;
  member_count: number;
}
