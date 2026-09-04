import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser-safe Supabase configuration reading standard Vite and process environment variables
const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://fvpnergqltezjbgbtwtv.supabase.co';

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  '';

export const supabaseConfig = {
  url: SUPABASE_URL,
  hasAnonKey: Boolean(SUPABASE_ANON_KEY),
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
};

export let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('[Supabase Init Error]', err);
  }
}

