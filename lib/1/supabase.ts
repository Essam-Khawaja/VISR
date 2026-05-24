import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAnonClient } from "@/lib/shared/supabase";

let _supabase: SupabaseClient | null = null;

/**
 * StraighterNoodles singleton client. Lazy-initialised; throws a clear error
 * when the public Supabase env vars are missing so the API routes surface
 * a 500 instead of an opaque undefined.
 */
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const client = createSupabaseAnonClient();
  if (!client) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables",
    );
  }
  _supabase = client;
  return _supabase;
}
