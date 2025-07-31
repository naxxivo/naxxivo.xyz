
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
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
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
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
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
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      anime_series: {
        Row: {
          id: number
          user_id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          banner_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          banner_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          banner_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_series_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      anime_episodes: {
        Row: {
          id: number
          series_id: number
          episode_number: number
          title: string | null
          video_url: string
          created_at: string
        }
        Insert: {
          id?: number
          series_id: number
          episode_number: number
          title?: string | null
          video_url: string
          created_at?: string
        }
        Update: {
          id?: number
          series_id?: number
          episode_number?: number
          title?: string | null
          video_url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_episodes_series_id_fkey"
            columns: ["series_id"]
            referencedRelation: "anime_series"
            referencedColumns: ["id"]
          }
        ]
      }
      market_categories: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      market_products: {
        Row: {
          id: number
          user_id: string
          category_id: number
          title: string
          description: string | null
          price: number
          currency: string
          location: string | null
          condition: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          category_id: number
          title: string
          description?: string | null
          price: number
          currency?: string
          location?: string | null
          condition?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          category_id?: number
          title?: string
          description?: string | null
          price?: number
          currency?: string
          location?: string | null
          condition?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_products_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      market_product_images: {
        Row: {
          id: number
          product_id: number
          image_url: string
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          image_url: string
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          image_url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "market_products"
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

// Manually define Row types to break circular dependencies and fix type instability.
export type Profile = {
  id: string;
  username: string;
  created_at: string;
  name: string | null;
  bio: string | null;
  photo_url: string | null;
  cover_url: string | null;
  address: string | null;
  website_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
};
export type PostRow = {
  id: number;
  user_id: string;
  caption: string | null;
  content_url: string | null;
  created_at: string;
};
export type Like = {
  id: number;
  user_id: string;
  post_id: number;
  created_at: string;
};
export type Comment = {
  id: number;
  user_id: string;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
};
export type Message = {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  status: string;
  created_at: string;
};
export type AnimeSeries = {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
  created_at: string;
};
export type AnimeEpisode = {
  id: number;
  series_id: number;
  episode_number: number;
  title: string | null;
  video_url: string;
  created_at: string;
};
export type MarketCategory = {
  id: number;
  name: string;
  created_at: string;
};
export type MarketProduct = {
  id: number;
  user_id: string;
  category_id: number;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  location: string | null;
  condition: string | null;
  status: string;
  created_at: string;
};
export type MarketProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  created_at: string;
};


// Composite types using the base types
// This was causing "Type instantiation is excessively deep" errors.
// By defining the properties directly, we break the complex type dependency.
export type AppUser = {
  id: string;
  app_metadata: { provider?: string; [key: string]: any; };
  user_metadata: { [key: string]: any; };
  aud: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  new_phone?: string;
  invited_at?: string;
  action_link?: string;
  email?: string;
  phone?: string;
  created_at: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
  identities?: any[];
  // Custom profile fields
  username: string;
  name: string | null;
  bio: string | null;
  photo_url: string | null;
  cover_url: string | null;
  address: string | null;
  website_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
};


export type Post = PostRow & {
  profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
  likes: { count: number }[];
  comments: { count: number }[];
  is_liked: boolean;
};

export interface PostCardProps {
  post: Post;
  onPostUpdated: (updatedPost: Post) => void;
  onPostDeleted: (postId: number) => void;
}

export type CommentWithProfile = Comment & {
  profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
};

export type ChatPartner = Profile & {
    last_message: string | null;
    last_message_at: string | null;
};

export type MessageWithProfile = Message & {
    sender: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
};

export type AnimeSeriesWithEpisodes = AnimeSeries & {
    anime_episodes: AnimeEpisode[];
};

export type AnimeEpisodeWithSeries = AnimeEpisode & { 
    anime_series: AnimeSeries 
};

export type MarketProductWithDetails = MarketProduct & {
  market_categories: Pick<MarketCategory, 'name'> | null;
  profiles: Pick<Profile, 'id' | 'name' | 'photo_url' | 'username'> | null;
  market_product_images: Pick<MarketProductImage, 'image_url'>[];
};
