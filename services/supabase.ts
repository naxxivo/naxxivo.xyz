
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// ===================================================================================
// !! IMPORTANT: MIGRATE TO YOUR NEW SUPABASE PROJECT !!
// ===================================================================================
// 1. Go to your new Supabase project's dashboard.
// 2. Navigate to Project Settings > API.
// 3. Find the 'Project URL' and the 'anon' 'public' key.
// 4. Replace the placeholder values below with your new credentials.
//
// 5. IMPORTANT: In your NEW Supabase project, you must also configure your domain for authentication.
//    - Go to Supabase Dashboard -> Authentication -> URL Configuration
//    - Site URL: https://naxxivo.xyz
//    - Additional Redirect URLs: https://naxxivo.xyz/**
// ===================================================================================


const supabaseUrl = 'https://ltmzhrgopdkrlsmigcpw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bXpocmdvcGRrcmxzbWlnY3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjM3OTgsImV4cCI6MjA2OTQzOTc5OH0.TJ_WFfIL84imTgMfjR4mheQZqLy1qPLLpr-bhlb9nRE';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/* 
  === SUPABASE DATABASE SETUP (FULL SCHEMA) ===
  
  This is the complete SQL script for your application.
  Run this entire script in your NEW Supabase project's SQL Editor to set up the database correctly.

  --- SCRIPT START ---

  -- Clean up existing tables in the correct order to avoid dependency errors
  DROP TABLE IF EXISTS public.likes CASCADE;
  DROP TABLE IF EXISTS public.comments CASCADE;
  DROP TABLE IF EXISTS public.posts CASCADE;
  DROP TABLE IF EXISTS public.messages CASCADE;
  DROP TABLE IF EXISTS public.follows CASCADE;
  DROP TABLE IF EXISTS public.anime_episodes CASCADE;
  DROP TABLE IF EXISTS public.anime_series CASCADE;
  DROP TABLE IF EXISTS public.market_product_images CASCADE;
  DROP TABLE IF EXISTS public.market_products CASCADE;
  DROP TABLE IF EXISTS public.market_categories CASCADE;
  DROP TABLE IF EXISTS public.profiles CASCADE;

  -- Table: profiles
  CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text NOT NULL UNIQUE CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$' AND lower(username) = username),
    name text,
    bio text,
    photo_url text,
    cover_url text,
    website_url text,
    youtube_url text,
    facebook_url text,
    address text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';

  -- Table: posts
  CREATE TABLE public.posts (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    caption text,
    content_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.posts IS 'User-created posts with media content and captions.';

  -- Table: comments
  CREATE TABLE public.comments (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id bigint NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    parent_comment_id bigint REFERENCES public.comments(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.comments IS 'Comments made by users on posts.';

  -- Table: likes
  CREATE TABLE public.likes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id bigint NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id)
  );
  COMMENT ON TABLE public.likes IS 'Tracks user likes on posts.';

  -- Table: messages (Simplified for direct messaging)
  CREATE TABLE public.messages (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'sent'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.messages IS 'Direct messages between two users.';
  
  -- Table: follows
  CREATE TABLE public.follows (
    follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
  );
  COMMENT ON TABLE public.follows IS 'Tracks user follow relationships.';
  
  -- Table: anime_series
  CREATE TABLE public.anime_series (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text,
      thumbnail_url text,
      banner_url text,
      created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.anime_series IS 'Stores information about anime series.';

  -- Table: anime_episodes
  CREATE TABLE public.anime_episodes (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      series_id bigint NOT NULL REFERENCES public.anime_series(id) ON DELETE CASCADE,
      episode_number integer NOT NULL,
      title text,
      video_url text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      UNIQUE (series_id, episode_number)
  );
  COMMENT ON TABLE public.anime_episodes IS 'Stores individual episodes for an anime series.';

  -- ROW LEVEL SECURITY (RLS) POLICIES
  
  -- Profiles RLS
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
  CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

  -- Posts RLS
  ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can create posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update their own posts." ON public.posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete their own posts." ON public.posts FOR DELETE USING (auth.uid() = user_id);

  -- Comments RLS
  ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can create comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  CREATE POLICY "Users can delete their own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);

  -- Likes RLS
  ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Likes are viewable by everyone." ON public.likes FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can create likes." ON public.likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  CREATE POLICY "Users can delete their own likes." ON public.likes FOR DELETE USING (auth.uid() = user_id);

  -- Messages RLS
  ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can see their own messages." ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  CREATE POLICY "Users can send messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  CREATE POLICY "Users can mark their received messages as read." ON public.messages FOR UPDATE USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);

  -- Follows RLS
  ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Follows are public." ON public.follows FOR SELECT USING (true);
  CREATE POLICY "Users can follow others." ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
  CREATE POLICY "Users can unfollow." ON public.follows FOR DELETE USING (auth.uid() = follower_id);
  
  -- Anime Series RLS
  ALTER TABLE public.anime_series ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anime series are public." ON public.anime_series FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can create anime series." ON public.anime_series FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update their own anime series." ON public.anime_series FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete their own anime series." ON public.anime_series FOR DELETE USING (auth.uid() = user_id);

  -- Anime Episodes RLS
  ALTER TABLE public.anime_episodes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anime episodes are public." ON public.anime_episodes FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can create anime episodes." ON public.anime_episodes FOR INSERT WITH CHECK (
    exists(select 1 from public.anime_series where id = series_id and user_id = auth.uid())
  );
  CREATE POLICY "Users can update their own anime episodes." ON public.anime_episodes FOR UPDATE USING (
    exists(select 1 from public.anime_series where id = series_id and user_id = auth.uid())
  ) WITH CHECK (
    exists(select 1 from public.anime_series where id = series_id and user_id = auth.uid())
  );
  CREATE POLICY "Users can delete their own anime episodes." ON public.anime_episodes FOR DELETE USING (
    exists(select 1 from public.anime_series where id = series_id and user_id = auth.uid())
  );
  --- SCRIPT END ---


  ===================================================================================
  !! IMPORTANT: RUN THIS SCRIPT TO FIX USER SIGN-UP !!
  ===================================================================================

  This script creates a trigger that automatically creates a user profile on the backend
  when a new user signs up. This fixes the "violates row-level security" error and
  makes the sign-up process secure and reliable.

  --- TRIGGER SCRIPT START ---

  -- Function to create a profile for a new user from auth.users
  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer set search_path = public
  as $$
  begin
    insert into public.profiles (id, username, name, photo_url)
    values (
      new.id,
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'photo_url'
    );
    return new;
  end;
  $$;

  -- Trigger to call the function when a new user signs up in auth.users
  create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

  --- TRIGGER SCRIPT END ---


  ===================================================================================
  !! IMPORTANT: RUN THIS SCRIPT TO ENABLE ADMIN PANEL !!
  ===================================================================================

  This script adds user roles, creates a function to check for admin status, and
  updates all security policies to give admins full control.

  --- ADMIN PANEL SCRIPT START ---

  -- 1. Add 'role' column to profiles table
  ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

  -- 2. Create a function to check if the current user is an admin
  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE plpgsql
  AS $$
  DECLARE
      user_role text;
  BEGIN
      IF auth.uid() IS NULL THEN
          RETURN FALSE;
      END IF;
      SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
      RETURN user_role = 'admin';
  END;
  $$;

  -- 3. Update RLS policies for all tables to grant admin access
  
  -- PROFILES
  DROP POLICY IF EXISTS "Admins can do anything." ON public.profiles;
  CREATE POLICY "Admins can do anything." ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

  -- POSTS
  DROP POLICY IF EXISTS "Admins can do anything." ON public.posts;
  CREATE POLICY "Admins can do anything." ON public.posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

  -- COMMENTS
  DROP POLICY IF EXISTS "Admins can delete any comment." ON public.comments;
  CREATE POLICY "Admins can delete any comment." ON public.comments FOR DELETE
  USING (public.is_admin());

  -- MESSAGES (Admins can read all messages for moderation, but not send as others)
  DROP POLICY IF EXISTS "Admins can read all messages." ON public.messages;
  CREATE POLICY "Admins can read all messages." ON public.messages FOR SELECT
  USING (public.is_admin());
  
  -- FOLLOWS
  DROP POLICY IF EXISTS "Admins can manage follows." ON public.follows;
  CREATE POLICY "Admins can manage follows." ON public.follows FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

  -- ANIME SERIES
  DROP POLICY IF EXISTS "Admins can manage anime series." ON public.anime_series;
  CREATE POLICY "Admins can manage anime series." ON public.anime_series FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

  -- ANIME EPISODES
  DROP POLICY IF EXISTS "Admins can manage anime episodes." ON public.anime_episodes;
  CREATE POLICY "Admins can manage anime episodes." ON public.anime_episodes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

  --- ADMIN PANEL SCRIPT END ---


  ===================================================================================
  !! IMPORTANT: RUN THIS SCRIPT TO UPGRADE THE MARKETPLACE !!
  ===================================================================================
  -- This script drops the old marketplace tables and creates a new, advanced version
  -- that supports direct image uploads.

  --- MARKETPLACE UPGRADE SCRIPT START ---

  -- 1. Drop old tables
  DROP TABLE IF EXISTS public.market_product_images CASCADE;
  DROP TABLE IF EXISTS public.market_products CASCADE;
  DROP TABLE IF EXISTS public.market_categories CASCADE;

  -- 2. Recreate tables with new structure
  CREATE TABLE public.market_categories (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name text NOT NULL UNIQUE,
      created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.market_categories IS 'Stores product categories for the marketplace.';

  CREATE TABLE public.market_products (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      category_id bigint NOT NULL REFERENCES public.market_categories(id) ON DELETE RESTRICT,
      title text NOT NULL,
      description text,
      price numeric(10, 2) NOT NULL CHECK (price >= 0),
      currency text NOT NULL DEFAULT 'USD',
      location text,
      condition text,
      status text NOT NULL DEFAULT 'available',
      created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.market_products IS 'Stores products listed in the marketplace.';

  -- NOTE: This table now stores a PATH to the image in storage, not a public URL.
  CREATE TABLE public.market_product_images (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      product_id bigint NOT NULL REFERENCES public.market_products(id) ON DELETE CASCADE,
      image_path text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now()
  );
  COMMENT ON TABLE public.market_product_images IS 'Stores image paths for each product in Supabase Storage.';

  -- 3. Create Storage Bucket for product images
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('product_images', 'product_images', true)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Set RLS Policies for new tables
  -- Categories
  ALTER TABLE public.market_categories ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Market categories are public." ON public.market_categories FOR SELECT USING (true);
  -- Products
  ALTER TABLE public.market_products ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Market products are viewable by everyone." ON public.market_products FOR SELECT USING (true);
  CREATE POLICY "Users can list their own products." ON public.market_products FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update their own products." ON public.market_products FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete their own products." ON public.market_products FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
  CREATE POLICY "Admins can manage market products." ON public.market_products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  -- Images
  ALTER TABLE public.market_product_images ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Product images are viewable by everyone." ON public.market_product_images FOR SELECT USING (true);
  CREATE POLICY "Users can add images to their own products." ON public.market_product_images FOR INSERT WITH CHECK (exists(select 1 from public.market_products where id = product_id and user_id = auth.uid()));
  CREATE POLICY "Users can delete images from their own products." ON public.market_product_images FOR DELETE USING (exists(select 1 from public.market_products where id = product_id and user_id = auth.uid()));
  CREATE POLICY "Admins can manage market product images." ON public.market_product_images FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

  -- 5. Set RLS Policies for Storage Bucket
  -- Allow public read access
  CREATE POLICY "Product images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
  -- Allow authenticated users to upload images
  CREATE POLICY "Authenticated users can upload product images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product_images' AND auth.role() = 'authenticated');
  -- Allow owners or admins to delete images
  CREATE POLICY "Users can delete their own product images." ON storage.objects FOR DELETE USING (bucket_id = 'product_images' AND owner = auth.uid());
  CREATE POLICY "Admins can delete any product image." ON storage.objects FOR DELETE USING (bucket_id = 'product_images' AND public.is_admin());

  -- 6. Pre-populate categories
  INSERT INTO public.market_categories (name) VALUES
  ('Electronics'), ('Fashion & Apparel'), ('Home & Garden'), ('Vehicles'), ('Toys & Hobbies'), ('Books & Media'), ('Collectibles & Art'), ('Other');

  --- MARKETPLACE UPGRADE SCRIPT END ---
*/