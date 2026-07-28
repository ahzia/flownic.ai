import { createClient } from "@supabase/supabase-js";
import { getEnv, getSupabaseSecretKey } from "@/shared/env";

/** Secret-key client — server only. Never import from client components. */
export function createSecretSupabaseClient() {
  const env = getEnv();
  const secretKey = getSupabaseSecretKey(env);
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !secretKey) {
    throw new Error("Supabase secret key is not configured.");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
