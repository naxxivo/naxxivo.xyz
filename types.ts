import { User } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          name: string | null
          bio: string | null
          photo_url: string | null
          cover_url: string | null
          address: string | null
          website_url: string | null
          youtube_url: string | null
          facebook_url: string | null
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          name?: string | null
          bio?: string | null
          photo_url?: string | null
          cover_url?: string | null
          address?: string | null
          website_url?: string | null
          youtube_url?: string | null
          facebook_url?: string | null
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          name?: string | null
          bio?: string | null
          photo_url?: string | null
          cover_url?: string | null
          address?: string | null
          website_url?: string | null
          youtube_url?: string | null
          facebook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          id: number
          user_id: string
          caption: string | null
          content_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          caption?: string | null
          content_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          caption?: string | null
          content_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: number
          user_id: string
          post_id: number
          parent_comment_id: number | null
          content: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          post_id: number
          parent_comment_id?: number | null
          content: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          post_id?: number
          parent_comment_id?: number | null
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          id: number
          user_id: string
          post_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          post_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          post_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: number
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          status?: string
          created_at?: string
        }
        Update: {
          id?: number
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AppUser = User & Omit<Profile, 'id' | 'created_at'>;

export type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

export interface PostCardProps {
  post: Post;
  onPostUpdated: (updatedPost: Post) => void;
  onPostDeleted: (postId: number) => void;
}


export type Like = Database['public']['Tables']['likes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentWithProfile = Comment & {
  profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
};

export type Message = Database['public']['Tables']['messages']['Row'];

// This type represents a chat partner in the new direct messaging system
export type ChatPartner = Profile & {
    last_message: string | null;
    last_message_at: string | null;
};