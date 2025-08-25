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
          details: Json | null
          id: number
          target_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          details?: Json | null
          target_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          details?: Json | null
          target_id?: string
        }
      },
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
      },
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
      },
      app_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string | null
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
        }
      },
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
      },
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
      },
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
      },
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
      },
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          actor_id: string | null;
          entity_id: string | null;
          content: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          actor_id?: string | null;
          entity_id?: string | null;
          content?: Json | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      },
      xp_products: {
        Row: {
          created_at: string
          description: string | null
          details: Json | null
          icon: string | null
          id: number
          is_active: boolean
          name: string
          price: number
          product_type: Database["public"]["Enums"]["xp_product_type"]
        }
        Insert: {
          description?: string | null
          details?: Json | null
          icon?: string | null
          is_active?: boolean
          name: string
          price: number
          product_type: Database["public"]["Enums"]["xp_product_type"]
        }
        Update: {
          description?: string | null
          details?: Json | null
          icon?: string | null
          is_active?: boolean
          name?: string
          price?: number
          product_type?: Database["public"]["Enums"]["xp_product_type"]
        }
      },
      products: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          stock_quantity?: number
        }
        Update: {
          category_id?: string | null
          created_by?: string | null
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          stock_quantity?: number
        }
      },
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          image_url?: string | null
        }
      },
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          quantity?: number
        }
      },
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          order_status: Database["public"]["Enums"]["order_status"]
          shipping_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          order_status?: Database["public"]["Enums"]["order_status"]
          shipping_address?: string | null
        }
        Update: {
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          order_status?: Database["public"]["Enums"]["order_status"]
          shipping_address?: string | null
        }
      },
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {}
      },
      profile_gifs: {
        Row: {
          id: number
          user_id: string
          gif_url: string
          storage_path: string
          created_at: string
        }
        Insert: {
          user_id: string
          gif_url: string
          storage_path: string
        }
        Update: {
          user_id?: string
          gif_url?: string
          storage_path?: string
        }
      },
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
      },
      profiles: {
        Row: {
          id: string
          name: string | null
          photo_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          is_admin: boolean | null
        }
        Insert: {
          id: string
          name?: string | null
          photo_url?: string | null
          bio?: string | null
          cover_url?: string | null
          is_admin?: boolean | null
        }
        Update: {
          name?: string | null
          photo_url?: string | null
          bio?: string | null
          cover_url?: string | null
          is_admin?: boolean | null
        }
      }
    },
    Enums: {
      notification_type: "follow" | "like" | "comment" | "mention" | "system"
      order_payment_status: "pending" | "paid" | "failed" | "refunded"
      order_status:
        | "pending_payment"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_method: "credit_card" | "paypal" | "bank_transfer"
      payment_status: "pending" | "completed" | "failed"
      xp_product_type: "subscription" | "one_time" | "cosmetic"
    }
  }
}