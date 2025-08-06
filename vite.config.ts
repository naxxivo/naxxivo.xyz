
import path from 'path';
import { defineConfig } from 'vite';

// This configuration directly reads from the system's process.env during the build.
// This is a more robust method than using `loadEnv`, which only loads variables from .env files.
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  define: {
    // Vite's `define` performs a direct string replacement during the build.
    // We use `JSON.stringify` to ensure the values are correctly quoted as strings in the client code.
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    
    // Support both VITE_ and NEXT_PUBLIC_ prefixes for Supabase variables to make the configuration
    // flexible across different deployment environments (like Vercel, which uses NEXT_PUBLIC_).
    'process.env.SUPABASE_URL': JSON.stringify(process.env.https://ltmzhrgopdkrlsmigcpw.supabase.co || process.env.NEXT_PUBLIC_SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bXpocmdvcGRrcmxzbWlnY3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjM3OTgsImV4cCI6MjA2OTQzOTc5OH0.TJ_WFfIL84imTgMfjR4mheQZqLy1qPLLpr-bhlb9nRE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },
  resolve: {
    alias: {
      '@': path.resolve('.'),
    }
  }
});
