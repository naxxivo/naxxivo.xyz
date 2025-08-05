export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: number
          parent_comment_id: number | null
          post_id: number
          user_id: string
        }
        Insert: {
          content: string
          parent_comment_id?: number | null
          post_id: number
          user_id: string
        }
        Update: {
          content?: string
          parent_comment_id?: number | null
          post_id?: number
          user_id?: string
        }
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
      }
      game_moves: {
        Row: {
          created_at: string
          game_id: string
          id: string
          move_data: Json
          move_number: number
          player_id: string
        }
        Insert: {
          game_id: string
          move_data: Json
          move_number: number
          player_id: string
        }
        Update: {
          game_id?: string
          move_data?: Json
          move_number?: number
          player_id?: string
        }
      }
      game_players: {
        Row: {
          created_at: string
          game_id: string
          is_host: boolean
          player_id: string
          player_symbol: string
        }
        Insert: {
          game_id: string
          is_host?: boolean
          player_id: string
          player_symbol: string
        }
        Update: {
          game_id?: string
          is_host?: boolean
          player_id?: string
          player_symbol?: string
        }
      }
      games: {
        Row: {
          created_at: string
          game_type: string
          id: string
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          game_type: string
          status: string
          winner_id?: string | null
        }
        Update: {
          game_type?: string
          status?: string
          winner_id?: string | null
        }
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
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean
          post_id: number | null
          sender_id: string
          type: string
          user_id: string
        }
        Insert: {
          is_read?: boolean
          post_id?: number | null
          sender_id: string
          type: string
          user_id: string
        }
        Update: {
          is_read?: boolean
          post_id?: number | null
          sender_id?: string
          type?: string
          user_id?: string
        }
      }
      page_components: {
        Row: {
          component_data: Json
          component_type: string
          created_at: string | null
          grid_position: Json | null
          id: string
          page_id: string | null
        }
        Insert: {
          component_data: Json
          component_type: string
          grid_position?: Json | null
          page_id?: string | null
        }
        Update: {
          component_data?: Json
          component_type?: string
          grid_position?: Json | null
          page_id?: string | null
        }
      }
      posts: {
        Row: {
          caption: string | null
          content_url: string | null
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_url?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          content_url?: string | null
          user_id?: string
        }
      }
      premium_features: {
        Row: {
          created_at: string
          id: number
          music_url: string | null
          profile_id: string
        }
        Insert: {
          music_url?: string | null
          profile_id: string
        }
        Update: {
          music_url?: string | null
          profile_id?: string
        }
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
      }
      profiles: {
        Row: {
          address: string | null
          admin: boolean | null
          bio: string | null
          cover_url: string | null
          created_at: string
          facebook_url: string | null
          id: string
          name: string | null
          photo_url: string | null
          role: string
          username: string
          website_url: string | null
          xp_balance: number
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          admin?: boolean | null
          bio?: string | null
          cover_url?: string | null
          facebook_url?: string | null
          id: string
          name?: string | null
          photo_url?: string | null
          role?: string
          username: string
          website_url?: string | null
          xp_balance?: number
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          admin?: boolean | null
          bio?: string | null
          cover_url?: string | null
          facebook_url?: string | null
          id?: string
          name?: string | null
          photo_url?: string | null
          role?: string
          username?: string
          website_url?: string | null
          xp_balance?: number
          youtube_url?: string | null
        }
      }
      site_pages: {
        Row: {
          id: string
          metadata: Json | null
          page_order: number | null
          page_slug: string
          published: boolean | null
          site_id: string | null
        }
        Insert: {
          metadata?: Json | null
          page_order?: number | null
          page_slug: string
          published?: boolean | null
          site_id?: string | null
        }
        Update: {
          metadata?: Json | null
          page_order?: number | null
          page_slug?: string
          published?: boolean | null
          site_id?: string
        }
      }
      site_versions: {
        Row: {
          created_at: string | null
          id: string
          site_id: string | null
          snapshot: Json
        }
        Insert: {
          site_id?: string | null
          snapshot: Json
        }
        Update: {
          site_id?: string | null
          snapshot?: Json
        }
      }
      user_sites: {
        Row: {
          created_at: string | null
          id: string
          site_name: string | null
          subdomain_path: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          site_name?: string | null
          subdomain_path: string
          user_id: string
        }
        Update: {
          site_name?: string | null
          subdomain_path?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
  T extends keyof PublicSchema["CompositeTypes"]
> = PublicSchema["CompositeTypes"][T]

export const Constants = {
  public: {
    Enums: {},
  },
} as const