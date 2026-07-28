import { NextResponse } from "next/server";
import {
  getEnv,
  getFeatureFlags,
  hasLiveKitConfig,
  hasOpenAIConfig,
  hasSupabasePublicConfig,
} from "@/shared/env";

export function GET() {
  const env = getEnv();
  const flags = getFeatureFlags(env);
  return NextResponse.json({
    ok: true,
    environment: env.NEXT_PUBLIC_ENVIRONMENT,
    supabaseConfigured: hasSupabasePublicConfig(env),
    livekitConfigured: hasLiveKitConfig(env),
    openaiConfigured: hasOpenAIConfig(env),
    flags: {
      peerSessionsEnabled: flags.peerSessionsEnabled,
      aiFallbackEnabled: flags.aiFallbackEnabled,
      videoEnabled: flags.videoEnabled,
    },
  });
}
