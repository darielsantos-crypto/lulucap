import { createClient } from '@supabase/supabase-js';

/**
 * These defaults preserve the current LuluCap connection already used by the
 * deployed app. Vercel environment variables take precedence when present.
 * The publishable/anon key is designed for browser use; never add a service key
 * to this project or to Vercel's public VITE_ variables.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vxwlzfidbcdzdusenxns.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lufszmzag1-zfj1rdn3ByA__mO7T9jQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
