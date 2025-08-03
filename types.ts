


// Manually define Row types to break circular dependencies and fix type instability.
export interface Profile {
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
export interface PostRow {
  id: number;
  user_id: string;
  caption: string | null;
  content_url: string | null;
  created_at: string;
};
export interface Like {
  id: number;
  user_id: string;
  post_id: number;
  created_at: string;
};
export interface Comment {
  id: number;
  user_id: string;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
};
export interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  status: string;
  created_at: string;
};
export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
};
export interface NotificationRow {
  id: number;
  user_id: string;
  sender_id: string;
  type: 'like' | 'comment' | 'follow';
  post_id: number | null;
  is_read: boolean;
  created_at: string;
};
export interface AnimeSeries {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
  created_at: string;
};
export interface AnimeEpisode {
  id: number;
  series_id: number;
  episode_number: number;
  title: string | null;
  video_url: string;
  created_at: string;
};
export interface MarketCategory {
  id: number;
  name: string;
  created_at: string;
};
export interface MarketProduct {
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
export interface MarketProductImage {
  id: number;
  product_id: number;
  image_path: string;
  created_at: string;
};

// --- INSERT AND UPDATE TYPES ---
// By explicitly defining these, we prevent TypeScript from entering an infinite
// recursion loop when inferring them from the complex schema, which fixes the
// "type instantiation is excessively deep" and "is not assignable to never" errors.

export interface ProfileInsert {
  id: string;
  username: string;
  role?: string;
  name?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  cover_url?: string | null;
  address?: string | null;
  website_url?: string | null;
  youtube_url?: string | null;
  facebook_url?: string | null;
};
export interface ProfileUpdate {
  username?: string;
  role?: string;
  name?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  cover_url?: string | null;
  address?: string | null;
  website_url?: string | null;
  youtube_url?: string | null;
  facebook_url?: string | null;
};

export interface PostRowInsert {
  user_id: string;
  caption?: string | null;
  content_url?: string | null;
};
export interface PostRowUpdate {
  user_id?: string;
  caption?: string | null;
  content_url?: string | null;
  created_at?: string;
};

export interface LikeInsert {
  user_id: string;
  post_id: number;
};
export interface LikeUpdate {
  user_id?: string;
  post_id?: number;
  created_at?: string;
};

export interface CommentInsert {
  user_id: string;
  post_id: number;
  content: string;
  parent_comment_id?: number | null;
};
export interface CommentUpdate {
  user_id?: string;
  post_id?: number;
  parent_comment_id?: number | null;
  content?: string;
  created_at?: string;
};

export interface MessageInsert {
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read?: boolean;
  status?: string;
};
export interface MessageUpdate {
  sender_id?: string;
  recipient_id?: string;
  content?: string;
  is_read?: boolean;
  status?: string;
  created_at?: string;
};

export interface FollowInsert {
  follower_id: string;
  following_id: string;
};
export interface FollowUpdate {
  follower_id?: string;
  following_id?: string;
  created_at?: string;
};

export interface NotificationRowInsert {
  user_id: string;
  sender_id: string;
  type: 'like' | 'comment' | 'follow';
  post_id?: number | null;
  is_read?: boolean;
};
export interface NotificationRowUpdate {
  user_id?: string;
  sender_id?: string;
  type?: 'like' | 'comment' | 'follow';
  post_id?: number | null;
  is_read?: boolean;
  created_at?: string;
};

export interface AnimeSeriesInsert {
  user_id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
};
export interface AnimeSeriesUpdate {
  user_id?: string;
  title?: string;
  description?: string | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  created_at?: string;
};

export interface AnimeEpisodeInsert {
  series_id: number;
  episode_number: number;
  video_url: string;
  title?: string | null;
};
export interface AnimeEpisodeUpdate {
  series_id?: number;
  episode_number?: number;
  title?: string | null;
  video_url?: string;
  created_at?: string;
};

export interface MarketCategoryInsert {
  name: string;
};
export interface MarketCategoryUpdate {
  name?: string;
  created_at?: string;
};

export interface MarketProductInsert {
  user_id: string;
  category_id: number;
  title: string;
  price: number;
  description?: string | null;
  currency?: string;
  location?: string | null;
  condition?: string | null;
  status?: string;
};
export interface MarketProductUpdate {
  user_id?: string;
  category_id?: number;
  title?: string;
  description?: string | null;
  price?: number;
  currency?: string;
  location?: string | null;
  condition?: string | null;
  status?: string;
  created_at?: string;
};

export interface MarketProductImageInsert {
  product_id: number;
  image_path: string;
};
export interface MarketProductImageUpdate {
  product_id?: number;
  image_path?: string;
  created_at?: string;
};


// By defining the Database structure manually with our own types, we avoid the "Type instantiation is excessively deep"
// error that can come from Supabase's automatic type generation on complex schemas. This also fixes the `... is not assignable to never`
// error in `insert` and `update` calls by providing a concrete type instead of `any`.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      posts: {
        Row: PostRow;
        Insert: PostRowInsert;
        Update: PostRowUpdate;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
        Relationships: [];
      };
      likes: {
        Row: Like;
        Insert: LikeInsert;
        Update: LikeUpdate;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
        Relationships: [];
      };
      follows: {
        Row: Follow;
        Insert: FollowInsert;
        Update: FollowUpdate;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationRowInsert;
        Update: NotificationRowUpdate;
        Relationships: [];
      };
      anime_series: {
        Row: AnimeSeries;
        Insert: AnimeSeriesInsert;
        Update: AnimeSeriesUpdate;
        Relationships: [];
      };
      anime_episodes: {
        Row: AnimeEpisode;
        Insert: AnimeEpisodeInsert;
        Update: AnimeEpisodeUpdate;
        Relationships: [];
      };
      market_categories: {
        Row: MarketCategory;
        Insert: MarketCategoryInsert;
        Update: MarketCategoryUpdate;
        Relationships: [];
      };
      market_products: {
        Row: MarketProduct;
        Insert: MarketProductInsert;
        Update: MarketProductUpdate;
        Relationships: [];
      };
      market_product_images: {
        Row: MarketProductImage;
        Insert: MarketProductImageInsert;
        Update: MarketProductImageUpdate;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};


// --- COMPOSITE TYPES ---
// These types combine base row types with related data (e.g., from joins).
// They are defined explicitly to prevent TypeScript from inferring circular dependencies.

export interface AppUser {
  // Fields from Supabase User
  id: string;
  app_metadata: { [key: string]: any };
  user_metadata: { [key: string]: any };
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
  updated_at?: string;
  identities?: { [key: string]: any }[];

  // Fields from our Profile table
  role: string;
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

export interface Post {
  // From PostRow
  id: number;
  user_id: string;
  caption: string | null;
  content_url: string | null;
  created_at: string;
  // Joined/calculated data
  profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
  likes: { count: number }[];
  comments: { count: number }[];
  is_liked: boolean;
};

export interface PostCardProps {
  post: Post;
  onPostUpdated?: (updatedPost: Post) => void;
  onPostDeleted?: (postId: number) => void;
  isSinglePostView?: boolean;
}

export interface CommentWithProfile {
  // From Comment
  id: number;
  user_id: string;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  // Joined data
  profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
};

export interface ChatPartner {
  // From Profile
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
  // Added data
  last_message: string | null;
  last_message_at: string | null;
};

export interface MessageWithProfile {
  // From Message
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  status: string;
  created_at: string;
  // Joined data
  sender: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
};

export interface NotificationWithSender {
    // From NotificationRow
    id: number;
    user_id: string;
    sender_id: string;
    type: 'like' | 'comment' | 'follow';
    post_id: number | null;
    is_read: boolean;
    created_at: string;
    // Joined data
    sender: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
};

export interface AnimeSeriesWithEpisodes {
    // From AnimeSeries
    id: number;
    user_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    banner_url: string | null;
    created_at: string;
    // Joined data
    anime_episodes: AnimeEpisode[];
};

export interface AnimeEpisodeWithSeries {
    // From AnimeEpisode
    id: number;
    series_id: number;
    episode_number: number;
    title: string | null;
    video_url: string;
    created_at: string;
    // Joined data
    anime_series: AnimeSeries;
};

export interface MarketProductWithDetails {
    // From MarketProduct
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
    // Joined data
    market_categories: Pick<MarketCategory, 'name'> | null;
    profiles: Pick<Profile, 'id' | 'name' | 'photo_url' | 'username'> | null;
    market_product_images: Pick<MarketProductImage, 'image_path'>[];
};

// Share Feature Types
export interface ShareData {
  title: string;
  text: string;
  url: string;
};

export interface UseShareReturn {
  share: (shareData: ShareData) => void;
  isModalOpen: boolean;
  shareData: ShareData | null;
  closeModal: () => void;
};
