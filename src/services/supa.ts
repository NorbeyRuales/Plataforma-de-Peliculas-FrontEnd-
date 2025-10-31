/**
 * @file supa.ts
 * @description Supabase client configuration shared across the application.
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL!
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!

/**
 * Singleton Supabase client instance with session persistence enabled.
 */
export const supa = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // required to process tokens returned via hash or query params
    // flowType: 'pkce', // optional if you need the PKCE flow
  },
})
