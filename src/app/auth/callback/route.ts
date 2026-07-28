import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/server/auth/supabase-server";
import { hasSupabasePublicConfig, getEnv } from "@/shared/env";

export async function GET(request: Request) {
  const env = getEnv();
  if (!hasSupabasePublicConfig(env)) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/intake";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
