export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: any | null
          id: number
          target_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          details?: any | null
          target_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          details?: any | null
          target_id?: string
        }
        Relationships: []
      }
      anime_episodes: {
        Row: {
          created_at: string
          episode_number: number
          id: number
          series_id: number
          title: string | null
          video_url: string
        }
        Insert: {
          episode_number: number
          series_id: number
          title?: string | null
          video_url: string
        }
        Update: {
          episode_number?: number
          series_id?: number
          title?: string | null
          video_url?: string
        }
        Relationships: []
      }
      anime_series: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: number
          thumbnail_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          banner_url?: string | null
          description?: string | null
          thumbnail_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          banner_url?: string | null
          description?: string | null
          thumbnail_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: number
          parent_comment_id: number | null
          post_id: number
          status: Database["public"]["Enums"]["comment_status"]
          user_id: string
        }
        Insert: {
          content: string
          parent_comment_id?: number | null
          post_id: number
          status?: Database["public"]["Enums"]["comment_status"]
          user_id: string
        }
        Update: {
          content?: string
          parent_comment_id?: number | null
          post_id?: number
          status?: Database["public"]["Enums"]["comment_status"]
          user_id?: string
        }
        Relationships: []
      }
      daily_claims: {
        Row: {
          claim_date: string
          claimed_xp: number
          created_at: string
          id: number
          user_id: string
          user_subscription_id: number
        }
        Insert: {
          claim_date: string
          claimed_xp: number
          user_id: string
          user_subscription_id: number
        }
        Update: {
          claim_date?: string
          claimed_xp?: number
          user_id?: string
          user_subscription_id?: number
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          follower_id: string
          following_id: string
        }
        Update: {
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: number
          post_id: number
          user_id: string
        }
        Insert: {
          post_id: number
          user_id: string
        }
        Update: {
          post_id?: number
          user_id?: string
        }
        Relationships: []
      }
      manual_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: number
          product_id: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          sender_details: string
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          product_id?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          sender_details: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          product_id?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          sender_details?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          is_read: boolean
          recipient_id: string
          sender_id: string
          status: string
        }
        Insert: {
          content: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
          status?: string
        }
        Update: {
          content?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption: string | null
          content_url: string | null
          created_at: string
          id: number
          status: Database["public"]["Enums"]["post_status"]
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_url?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          user_id: string
        }
        Update: {
          caption?: string | null
          content_url?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: number
          is_active: boolean
          name: string
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          subscription_daily_xp: number | null
          subscription_duration_days: number | null
          subscription_initial_xp: number | null
          xp_amount: number | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          is_active?: boolean
          name: string
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          subscription_daily_xp?: number | null
          subscription_duration_days?: number | null
          subscription_initial_xp?: number | null
          xp_amount?: number | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          is_active?: boolean
          name?: string
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          subscription_daily_xp?: number | null
          subscription_duration_days?: number | null
          subscription_initial_xp?: number | null
          xp_amount?: number | null
        }
        Relationships: []
      }
      profile_music: {
        Row: {
          created_at: string
          file_name: string | null
          id: number
          music_url: string
          profile_id: string
        }
        Insert: {
          file_name?: string | null
          music_url: string
          profile_id: string
        }
        Update: {
          file_name?: string | null
          music_url?: string
          profile_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          cover_url: string | null
          created_at: string
          id: string
          name: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          selected_music_id: number | null
          status: Database["public"]["Enums"]["profile_status"]
          username: string
          xp_balance: number
        }
        Insert: {
          bio?: string | null
          cover_url?: string | null
          id: string
          name?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          selected_music_id?: number | null
          status?: Database["public"]["Enums"]["profile_status"]
          username: string
          xp_balance?: number
        }
        Update: {
          bio?: string | null
          cover_url?: string | null
          id?: string
          name?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          selected_music_id?: number | null
          status?: Database["public"]["Enums"]["profile_status"]
          username?: string
          xp_balance?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: number
          is_active: boolean
          payment_id: number | null
          product_id: number | null
          start_date: string
          user_id: string
        }
        Insert: {
          end_date: string
          is_active?: boolean
          payment_id?: number | null
          product_id?: number | null
          start_date: string
          user_id: string
        }
        Update: {
          end_date?: string
          is_active?: boolean
          payment_id?: number | null
          product_id?: number | null
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_daily_xp: {
        Args: {
          p_subscription_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      comment_status: "live" | "hidden"
      payment_status: "pending" | "approved" | "rejected"
      post_status: "live" | "suspended" | "under_review"
      product_type: "package" | "subscription"
      profile_status: "active" | "banned"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      comment_status: {
        Live: "live",
        Hidden: "hidden",
      },
      payment_status: {
        Pending: "pending",
        Approved: "approved",
        Rejected: "rejected",
      },
      post_status: {
        Live: "live",
        Suspended: "suspended",
        UnderReview: "under_review",
      },
      product_type: {
        Package: "package",
        Subscription: "subscription",
      },
      profile_status: {
        Active: "active",
        Banned: "banned",
      },
      user_role: {
        User: "user",
        Admin: "admin",
      },
    },
  },
} as const