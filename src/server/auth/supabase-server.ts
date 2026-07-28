import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getEnv,
  getSupabasePublishableKey,
  hasSupabasePublicConfig,
} from "@/shared/env";

export async function createServerSupabaseClient() {
  const env = getEnv();
  const publishableKey = getSupabasePublishableKey(env);
  if (!hasSupabasePublicConfig(env) || !publishableKey) {
    throw new Error(
      "Supabase public env is not configured. Copy .env.example to .env.local.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }[],
      ) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware will refresh sessions.
        }
      },
    },
  });
}
