/**
 * Shared Supabase client factories.
 *
 * Two clients are exposed:
 *   - Anon: safe for browser and server; honors RLS. Used by Flowgram and
 *     by Strategy Web stores when they want to write through to Postgres.
 *   - Service role: server-only. Required by API routes that need to bypass
 *     RLS for the hackathon demo (the schema enables permissive policies
 *     anyway, but we still keep the boundary).
 *
 * Both factories return null when env vars are missing so the rest of the
 * app can degrade to localStorage without crashing the build.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseAnonClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseServiceClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseServiceClient must only run on the server.");
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // We never persist user sessions for the service-role client.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
