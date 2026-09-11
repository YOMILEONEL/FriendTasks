import type { Database, JoinRequestStatus, MyJoinStatus } from "@/lib/types/database";

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
  my_status: MyJoinStatus;
}

export interface ListJoinRequest {
  id: string;
  user_id: string;
  status: JoinRequestStatus;
  created_at: string;
  display_name: string;
  avatar_url: string | null;
  color: string;
}
