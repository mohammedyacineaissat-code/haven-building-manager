import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = supabaseUrl.startsWith('http');
const isValidKey = supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your_');

/**
 * Whether Supabase is properly configured with valid environment variables.
 * When false, the app operates in offline/localStorage-only mode.
 */
export const isSupabaseConfigured = isValidUrl && isValidKey;

if (!isSupabaseConfigured) {
  console.warn(
    '[Haven] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. Running in offline mode.'
  );
}

/**
 * Supabase client instance.
 * When credentials are not configured, a dummy client is created with empty strings — 
 * all queries will fail gracefully and the app falls back to localStorage.
 */
export const supabase: SupabaseClient = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co',
  isValidKey ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
