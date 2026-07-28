import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client — publishable key only; RLS enforces access. */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase public env is not configured. Copy .env.example to .env.local.",
    );
  }
  return createBrowserClient(url, publishableKey);
}
