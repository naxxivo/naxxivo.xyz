import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ltmzhrgopdkrlsmigcpw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bXpocmdvcGRrcmxzbWlnY3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjM3OTgsImV4cCI6MjA2OTQzOTc5OH0.TJ_WFfIL84imTgMfjR4mheQZqLy1qPLLpr-bhlb9nRE";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});