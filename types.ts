
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
export type NotificationRow = {
  id: number;
  user_id: string;
  sender_id: string;
  type: 'like' | 'comment' | 'follow';
  post_id: number | null;
  is_read: boolean;
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

// Health Hub Types
export type Remedy = {
  name: string;
  description: string;
};

export type Ailment = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  pharmaceuticalRemedies: Remedy[];
  homeRemedies: Remedy[];
};

// By defining the Database structure manually with our own types, we avoid the "Type instantiation is excessively deep"
// error that can come from Supabase's automatic type generation on complex schemas. This also fixes the `... is not assignable to never`
// error in `insert` and `update` calls by providing a concrete type instead of `any`.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username: string;
          name?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          cover_url?: string | null;
          address?: string | null;
          website_url?: string | null;
          youtube_url?: string | null;
          facebook_url?: string | null;
          role?: string;
        };
        Update: {
          username?: string;
          name?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          cover_url?: string | null;
          address?: string | null;
          website_url?: string | null;
          youtube_url?: string | null;
          facebook_url?: string | null;
          role?: string;
        };
      };
      posts: {
        Row: PostRow;
        Insert: {
          user_id: string;
          caption?: string | null;
          content_url?: string | null;
        };
        Update: {
          caption?: string | null;
          content_url?: string | null;
        };
      };
      comments: {
        Row: Comment;
        Insert: {
          user_id: string;
          post_id: number;
          parent_comment_id?: number | null;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      likes: {
        Row: Like;
        Insert: {
          user_id: string;
          post_id: number;
        };
        Update: never;
      };
      messages: {
        Row: Message;
        Insert: {
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read?: boolean;
          status?: string;
        };
        Update: {
          is_read?: boolean;
          status?: string;
        };
      };
      follows: {
        Row: Follow;
        Insert: {
          follower_id: string;
          following_id: string;
        };
        Update: never;
      };
      notifications: {
        Row: NotificationRow;
        Insert: {
          user_id: string;
          sender_id: string;
          type: 'like' | 'comment' | 'follow';
          post_id?: number | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
      anime_series: {
        Row: AnimeSeries;
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          banner_url?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          banner_url?: string | null;
        };
      };
      anime_episodes: {
        Row: AnimeEpisode;
        Insert: {
          series_id: number;
          episode_number: number;
          title?: string | null;
          video_url: string;
        };
        Update: {
          episode_number?: number;
          title?: string | null;
          video_url?: string;
        };
      };
      market_categories: {
        Row: MarketCategory;
        Insert: { name: string };
        Update: { name?: string };
      };
      market_products: {
        Row: MarketProduct;
        Insert: {
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
        Update: {
          category_id?: number;
          title?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          location?: string | null;
          condition?: string | null;
          status?: string;
        };
      };
      market_product_images: {
        Row: MarketProductImage;
        Insert: {
          product_id: number;
          image_path: string;
        };
        Update: never;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};


// Composite types using the base types

// The `AppUser` type previously referenced the base `User` type from Supabase,
// which caused a "Type instantiation is excessively deep" error. This new definition
// is fully self-contained, breaking the complex type dependency and allowing the
// compiler to correctly infer types for all database operations. This fixes the
// cascade of 'never' errors in `insert` and `update` calls.
export type AppUser = {
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

export type Post = PostRow & {
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

export type NotificationWithSender = NotificationRow & {
  sender: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
};

export type AnimeSeriesWithEpisodes = AnimeSeries & {
    anime_episodes: AnimeEpisode[];
};

export type AnimeEpisodeWithSeries = AnimeEpisode & {
    anime_series: AnimeSeries;
};

export type MarketProductWithDetails = MarketProduct & {
    market_categories: Pick<MarketCategory, 'name'> | null;
    profiles: Pick<Profile, 'id' | 'name' | 'photo_url' | 'username'> | null;
    market_product_images: Pick<MarketProductImage, 'image_path'>[];
};

// Share Feature Types
export type ShareData = {
  title: string;
  text: string;
  url: string;
};

export type UseShareReturn = {
  share: (shareData: ShareData) => void;
  isModalOpen: boolean;
  shareData: ShareData | null;
  closeModal: () => void;
};
