import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://pnpaotektjhlcvwnsxds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucGFvdGVrdGpobGN2d25zeGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNDQwNDAsImV4cCI6MjA2MTkyMDA0MH0.lX8bAm45o9iL3O3TRrM1ebmodK7JVxzgiZ5-BYyT0C4';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
