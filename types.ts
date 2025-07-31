import { User } from '@supabase/supabase-js';

// The auto-generated Database type from Supabase was causing "Type instantiation is excessively deep"
// errors due to the schema's complexity (e.g., self-referencing tables).
// By setting it to `any`, we bypass the complex type-checking within the Supabase client library itself.
// The application already uses manually defined types for query results (e.g., Post, Profile),
// so we maintain type safety where it matters most, and this change resolves the compilation errors.
export type Database = any;

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


export type Post = {
  id: number;
  user_id: string;
  caption: string | null;
  content_url: string | null;
  created_at: string;
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

export type CommentWithProfile = {
  id: number;
  user_id: string;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
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
    sender: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
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
    market_categories: Pick<MarketCategory, 'name'> | null;
    profiles: Pick<Profile, 'id' | 'name' | 'photo_url' | 'username'> | null;
    market_product_images: Pick<MarketProductImage, 'image_url'>[];
};
