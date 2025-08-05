

import type { User } from '@supabase/supabase-js';

// Manually define Row types to break circular dependencies and fix type instability.
export type Profile = {
  id: string;
  username: string;
  created_at: string;
  role: string;
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
export type Follow = {
  follower_id: string;
  following_id: string;
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
  image_path: string;
  created_at: string;
};


// Explicit Insert and Update types to fix 'never' and 'type instantiation' errors.
type ProfileInsert = {
  id: string;
  username: string;
  name?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  cover_url?: string | null;
  website_url?: string | null;
  youtube_url?: string | null;
  facebook_url?: string | null;
  address?: string | null;
  role?: string;
};
type ProfileUpdate = Partial<ProfileInsert>;

type PostRowInsert = {
  user_id: string;
  caption?: string | null;
  content_url?: string | null;
};
type PostRowUpdate = Partial<PostRowInsert>;

type CommentInsert = {
  user_id: string;
  post_id: number;
  parent_comment_id?: number | null;
  content: string;
};
type CommentUpdate = Partial<CommentInsert>;

type LikeInsert = {
  user_id: string;
  post_id: number;
};
type LikeUpdate = Partial<LikeInsert>;

type MessageInsert = {
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read?: boolean;
  status?: string;
};
type MessageUpdate = Partial<MessageInsert>;

type FollowInsert = {
  follower_id: string;
  following_id: string;
};
type FollowUpdate = Partial<FollowInsert>;

type AnimeSeriesInsert = {
  user_id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
};
type AnimeSeriesUpdate = Partial<AnimeSeriesInsert>;

type AnimeEpisodeInsert = {
  series_id: number;
  episode_number: number;
  title?: string | null;
  video_url: string;
};
type AnimeEpisodeUpdate = Partial<AnimeEpisodeInsert>;

type MarketCategoryInsert = {
  name: string;
};
type MarketCategoryUpdate = Partial<MarketCategoryInsert>;

type MarketProductInsert = {
  user_id: string;
  category_id: number;
  title: string;
  description?: string | null;
  price: number;
  currency?: string;
  location?: string | null;
  condition?: string | null;
  status?: string;
};
type MarketProductUpdate = Partial<MarketProductInsert>;

type MarketProductImageInsert = {
  product_id: number;
  image_path: string;
};
type MarketProductImageUpdate = Partial<MarketProductImageInsert>;


// By defining the Database structure manually with our own types, we avoid the "Type instantiation is excessively deep"
// error that can come from Supabase's automatic type generation on complex schemas. This also fixes the `... is not assignable to never`
// error in `insert` and `update` calls by providing a concrete type instead of `any`.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      posts: {
        Row: PostRow;
        Insert: PostRowInsert;
        Update: PostRowUpdate;
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
      likes: {
        Row: Like;
        Insert: LikeInsert;
        Update: LikeUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      follows: {
        Row: Follow;
        Insert: FollowInsert;
        Update: FollowUpdate;
      };
      anime_series: {
        Row: AnimeSeries;
        Insert: AnimeSeriesInsert;
        Update: AnimeSeriesUpdate;
      };
      anime_episodes: {
        Row: AnimeEpisode;
        Insert: AnimeEpisodeInsert;
        Update: AnimeEpisodeUpdate;
      };
      market_categories: {
        Row: MarketCategory;
        Insert: MarketCategoryInsert;
        Update: MarketCategoryUpdate;
      };
      market_products: {
        Row: MarketProduct;
        Insert: MarketProductInsert;
        Update: MarketProductUpdate;
      };
      market_product_images: {
        Row: MarketProductImage;
        Insert: MarketProductImageInsert;
        Update: MarketProductImageUpdate;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
};


// Simple, flat types for composition to avoid deep instantiation errors
type SimpleProfile = {
  name: string | null;
  photo_url: string | null;
  username: string;
};

type SimpleSellerProfile = {
  id: string;
  name: string | null;
  photo_url: string | null;
  username: string;
};

type SimpleMarketCategory = {
  name: string;
};

type SimpleProductImage = {
  image_path: string;
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


export type Post = {
  id: number;
  user_id: string;
  caption: string | null;
  content_url: string | null;
  created_at: string;
  profiles: SimpleProfile | null;
  likes: { count: number }[];
  comments: { count: number }[];
  is_liked: boolean;
};

export interface PostCardProps {
  post: Post;
  onPostUpdated: (updatedPost: Post) => void;
  onPostDeleted: (postId: number) => void;
}

export type CommentWithProfile = {
  id: number;
  user_id: string;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  profiles: SimpleProfile | null;
};

export type ChatPartner = {
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
    last_message: string | null;
    last_message_at: string | null;
};

export type MessageWithProfile = {
    id: number;
    sender_id: string;
    recipient_id: string;
    content: string;
    is_read: boolean;
    status: string;
    created_at: string;
    sender: SimpleProfile | null;
};

export type AnimeSeriesWithEpisodes = {
    id: number;
    user_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    banner_url: string | null;
    created_at: string;
    anime_episodes: AnimeEpisode[];
};

export type AnimeEpisodeWithSeries = {
    id: number;
    series_id: number;
    episode_number: number;
    title: string | null;
    video_url: string;
    created_at: string;
    anime_series: AnimeSeries;
};

export type MarketProductWithDetails = {
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
    market_categories: SimpleMarketCategory | null;
    profiles: SimpleSellerProfile | null;
    market_product_images: SimpleProductImage[];
};