import type { Database, GroupRole, JoinRequestStatus, MyJoinStatus } from "@/lib/types/database";

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
  my_status: MyJoinStatus;
}

export interface GroupJoinRequest {
  id: string;
  user_id: string;
  status: JoinRequestStatus;
  created_at: string;
  display_name: string;
  avatar_url: string | null;
  color: string;
}
