export type Priority = "low" | "medium" | "high";
export type TodoStatus = "open" | "done";
export type GroupRole = "admin" | "member";
export type Theme = "light" | "dark";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          theme: Theme;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          theme?: Theme;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
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
          owner_id: string;
          group_id: string | null;
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
          owner_id: string;
          group_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          due_time_end?: string | null;
          priority?: Priority;
          status?: TodoStatus;
          group_id?: string | null;
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
        Returns: { id: string; name: string; member_count: number }[];
      };
      join_group_by_token: {
        Args: { token: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
