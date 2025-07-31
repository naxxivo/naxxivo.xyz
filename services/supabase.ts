
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// IMPORTANT: In a real-world application, these values should be stored in
// environment variables (.env file) and not hardcoded in the source code.
const supabaseUrl = 'https://vhafkicrbzrkkhcijnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYWZraWNyYnpya2toY2lqbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMzU3MDEsImV4cCI6MjA2MTkxMTcwMX0.ZXJA6PHYYz7CSNn42Oecg8hs9_ORC2yE6AohmxW7A_M';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/* 
  === SUPABASE DATABASE SETUP (REVISED SCHEMA) ===
  
  This is the revised, normalized schema for the application.
  Run this entire script in your Supabase SQL Editor to set up the database correctly.
  NOTE: Running this script will DELETE existing tables if they exist.

  --- SCRIPT START ---

  -- Clean up existing tables in the correct order to avoid dependency errors
  DROP TABLE IF EXISTS public.likes CASCADE;
  DROP TABLE IF EXISTS public.comments CASCADE;
  DROP TABLE IF EXISTS public.posts CASCADE;
  DROP TABLE IF EXISTS public.messages CASCADE;
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

  --- SCRIPT END ---
*/
