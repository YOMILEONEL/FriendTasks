export type Priority = "low" | "medium" | "high";
export type TodoStatus = "open" | "done";
export type GroupRole = "admin" | "member";
export type Theme = "light" | "dark";
export type Recurrence = "weekly" | "monthly";
export type NotificationType = "assigned" | "comment" | "join_request" | "join_approved";
export type ActivityAction =
  | "todo_created"
  | "todo_completed"
  | "todo_deleted"
  | "member_joined"
  | "member_left"
  | "list_created"
  | "list_deleted";
export type JoinRequestStatus = "pending" | "approved" | "declined";
export type MyJoinStatus = "member" | "pending" | "declined" | "none";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          color: string;
          theme: Theme;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          color?: string;
          theme?: Theme;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          color?: string;
          theme?: Theme;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          invite_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: GroupRole;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: GroupRole;
        };
        Update: {
          role?: GroupRole;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      todos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          due_time: string | null;
          due_time_end: string | null;
          priority: Priority;
          status: TodoStatus;
          recurrence: Recurrence | null;
          recurrence_until: string | null;
          recurrence_weekdays: number[] | null;
          owner_id: string;
          group_id: string | null;
          list_id: string | null;
          claimable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          due_time_end?: string | null;
          priority?: Priority;
          status?: TodoStatus;
          recurrence?: Recurrence | null;
          recurrence_until?: string | null;
          recurrence_weekdays?: number[] | null;
          owner_id: string;
          group_id?: string | null;
          list_id?: string | null;
          claimable?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          due_time_end?: string | null;
          priority?: Priority;
          status?: TodoStatus;
          recurrence?: Recurrence | null;
          recurrence_until?: string | null;
          recurrence_weekdays?: number[] | null;
          group_id?: string | null;
          list_id?: string | null;
          claimable?: boolean;
        };
        Relationships: [];
      };
      todo_occurrence_completions: {
        Row: {
          todo_id: string;
          occurrence_date: string;
          completed_at: string;
        };
        Insert: {
          todo_id: string;
          occurrence_date: string;
        };
        Update: never;
        Relationships: [];
      };
      lists: {
        Row: {
          id: string;
          name: string;
          owner_id: string | null;
          group_id: string | null;
          invite_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id?: string | null;
          group_id?: string | null;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      list_members: {
        Row: {
          list_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          list_id: string;
          user_id: string;
        };
        Update: {
          list_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "list_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          todo_id: string | null;
          group_id: string | null;
          list_id: string | null;
          actor_id: string | null;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: never;
        Update: {
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_log: {
        Row: {
          id: string;
          group_id: string;
          actor_id: string | null;
          action: ActivityAction;
          detail: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      group_join_requests: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          status: JoinRequestStatus;
          created_at: string;
          decided_at: string | null;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          status?: JoinRequestStatus;
        };
        Update: {
          status?: JoinRequestStatus;
          decided_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "group_join_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      list_join_requests: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          status: JoinRequestStatus;
          created_at: string;
          decided_at: string | null;
        };
        Insert: {
          id?: string;
          list_id: string;
          user_id: string;
          status?: JoinRequestStatus;
        };
        Update: {
          status?: JoinRequestStatus;
          decided_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "list_join_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      todo_comments: {
        Row: {
          id: string;
          todo_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          author_id: string;
          content: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "todo_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      todo_attachments: {
        Row: {
          id: string;
          todo_id: string;
          storage_path: string;
          file_name: string;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          storage_path: string;
          file_name: string;
          file_size?: number | null;
          uploaded_by: string;
        };
        Update: never;
        Relationships: [];
      };
      group_notes: {
        Row: {
          group_id: string;
          content: string;
          updated_at: string;
        };
        Insert: {
          group_id: string;
          content?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      list_notes: {
        Row: {
          list_id: string;
          content: string;
          updated_at: string;
        };
        Insert: {
          list_id: string;
          content?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      subtasks: {
        Row: {
          id: string;
          todo_id: string;
          title: string;
          is_done: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          title: string;
          is_done?: boolean;
          position?: number;
        };
        Update: {
          title?: string;
          is_done?: boolean;
          position?: number;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          color?: string;
        };
        Update: {
          name?: string;
          color?: string;
        };
        Relationships: [];
      };
      todo_tags: {
        Row: {
          todo_id: string;
          tag_id: string;
        };
        Insert: {
          todo_id: string;
          tag_id: string;
        };
        Update: {
          todo_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "todo_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      todo_assignees: {
        Row: {
          todo_id: string;
          user_id: string;
        };
        Insert: {
          todo_id: string;
          user_id: string;
        };
        Update: {
          todo_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "todo_assignees_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_group_preview: {
        Args: { token: string };
        Returns: { id: string; name: string; member_count: number; my_status: MyJoinStatus }[];
      };
      join_group_by_token: {
        Args: { token: string };
        Returns: string;
      };
      get_list_preview: {
        Args: { token: string };
        Returns: { id: string; name: string; member_count: number; my_status: MyJoinStatus }[];
      };
      join_list_by_token: {
        Args: { token: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
