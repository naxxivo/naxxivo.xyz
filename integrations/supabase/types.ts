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
          created_at?: string
          episode_number: number
          id?: never
          series_id: number
          title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          episode_number?: number
          id?: never
          series_id?: number
          title?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "anime_series"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          description?: string | null
          id?: never
          thumbnail_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: never
          thumbnail_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_series_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          id?: never
          parent_comment_id?: number | null
          post_id: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: never
          parent_comment_id?: number | null
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          game_id: string
          id?: string
          move_data: Json
          move_number: number
          player_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          move_data?: Json
          move_number?: number
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_moves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_moves_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          game_id: string
          is_host?: boolean
          player_id: string
          player_symbol: string
        }
        Update: {
          created_at?: string
          game_id?: string
          is_host?: boolean
          player_id?: string
          player_symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          game_type: string
          id?: string
          status: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          game_type?: string
          id?: string
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: number
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          id?: never
          is_read?: boolean
          recipient_id: string
          sender_id: string
          status?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: never
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          id?: never
          is_read?: boolean
          post_id?: number | null
          sender_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          is_read?: boolean
          post_id?: number | null
          sender_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string | null
          grid_position?: Json | null
          id?: string
          page_id?: string | null
        }
        Update: {
          component_data?: Json
          component_type?: string
          created_at?: string | null
          grid_position?: Json | null
          id?: string
          page_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_components_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
          id?: never
          user_id: string
        }
        Update: {
          caption?: string | null
          content_url?: string | null
          created_at?: string
          id?: never
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_features: {
        Row: {
          created_at: string
          id: number
          music_url: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          music_url?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: never
          music_url?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_features_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string
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
          created_at?: string
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
        Relationships: []
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
          id?: string
          metadata?: Json | null
          page_order?: number | null
          page_slug: string
          published?: boolean | null
          site_id?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          page_order?: number | null
          page_slug?: string
          published?: boolean | null
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_pages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "user_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_versions: {
        Row: {
          created_at: string | null
          id: string
          site_id: string | null
          snapshot: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          site_id?: string | null
          snapshot: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          site_id?: string | null
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_versions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "user_sites"
            referencedColumns: ["id"]
          },
        ]
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
          created_at?: string | null
          id?: string
          site_name?: string | null
          subdomain_path: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          site_name?: string | null
          subdomain_path?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sites_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
  T extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
> = (PublicSchema["Tables"] & PublicSchema["Views"])[T]["Row"]

export type TablesInsert<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Update"]

export type Enums<
  T extends keyof PublicSchema["Enums"]
> = PublicSchema["Enums"][T]

export type CompositeTypes<
  T extends keyof PublicSchema["CompositeTypes"]
> = PublicSchema["CompositeTypes"][T]

export const Constants = {
  public: {
    Enums: {},
  },
} as const