import { z } from "zod";

const booleanFromEnv = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") return false;
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  });

/** Treat blank env values as unset — common in .env.local placeholders. */
function optionalString() {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().min(1).optional(),
  );
}

function optionalEmail() {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().email().optional(),
  );
}

function optionalUrl() {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().url().optional(),
  );
}

/**
 * Server/runtime environment.
 * Never add provider secrets to NEXT_PUBLIC_* keys.
 *
 * Supabase: use publishable + secret keys (legacy anon/service_role deprecated).
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_ENVIRONMENT: z
    .enum(["local", "preview", "production"])
    .default("local"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString(),
  /** @deprecated Prefer NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY */
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString(),
  SUPABASE_SECRET_KEY: optionalString(),
  /** Accept common typo from early local env files */
  SuPABASE_SECRET_KEY: optionalString(),
  /** @deprecated Prefer SUPABASE_SECRET_KEY */
  SUPABASE_SERVICE_ROLE_KEY: optionalString(),
  NEXT_PUBLIC_LIVEKIT_URL: optionalUrl(),
  LIVEKIT_API_KEY: optionalString(),
  LIVEKIT_API_SECRET: optionalString(),
  OPENAI_API_KEY: optionalString(),
  RESEND_API_KEY: optionalString(),
  EMAIL_FROM: optionalEmail(),
  SENTRY_DSN: optionalUrl(),
  AI_FOLLOWUP_MODEL: z.string().default("gpt-4.1-mini"),
  AI_FEEDBACK_MODEL: z.string().default("gpt-4.1"),
  AI_REALTIME_MODEL: z.string().default("gpt-4o-realtime-preview"),
  AI_TRANSCRIPTION_MODEL: z.string().default("gpt-4o-transcribe"),
  PAYMENT_LINK_URL: optionalUrl(),
  DEFAULT_TIMEZONE: z.string().default("Europe/Berlin"),
  DATA_RETENTION_POLICY_VERSION: z.string().default("2026-07-01"),
  CONSENT_POLICY_VERSION: z.string().default("2026-07-01"),
  STAFF_EMAIL_ALLOWLIST: optionalString(),
  FEATURE_PEER_SESSIONS_ENABLED: booleanFromEnv,
  FEATURE_AI_FALLBACK_ENABLED: booleanFromEnv,
  FEATURE_LIVE_TRANSCRIPTION_ENABLED: booleanFromEnv,
  FEATURE_EXAMINER_FOLLOWUPS_ENABLED: booleanFromEnv,
  FEATURE_VIDEO_ENABLED: booleanFromEnv,
  FEATURE_PILOT_RECORDING_ENABLED: booleanFromEnv,
  FEATURE_PAYMENT_OFFER_ENABLED: booleanFromEnv,
  FEATURE_REPORT_HUMAN_REVIEW_REQUIRED: booleanFromEnv,
});

export type Env = z.infer<typeof envSchema>;

export type FeatureFlags = {
  peerSessionsEnabled: boolean;
  aiFallbackEnabled: boolean;
  liveTranscriptionEnabled: boolean;
  examinerFollowupsEnabled: boolean;
  videoEnabled: boolean;
  pilotRecordingEnabled: boolean;
  paymentOfferEnabled: boolean;
  reportHumanReviewRequired: boolean;
};

let cached: Env | null = null;

export function getEnv(force = false): Env {
  if (cached && !force) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(details)}`);
  }
  cached = parsed.data;
  return cached;
}

export function getSupabasePublishableKey(env: Env = getEnv()): string | undefined {
  return (
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseSecretKey(env: Env = getEnv()): string | undefined {
  return (
    env.SUPABASE_SECRET_KEY ??
    env.SuPABASE_SECRET_KEY ??
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getFeatureFlags(env: Env = getEnv()): FeatureFlags {
  return {
    peerSessionsEnabled: env.FEATURE_PEER_SESSIONS_ENABLED,
    aiFallbackEnabled: env.FEATURE_AI_FALLBACK_ENABLED,
    liveTranscriptionEnabled: env.FEATURE_LIVE_TRANSCRIPTION_ENABLED,
    examinerFollowupsEnabled: env.FEATURE_EXAMINER_FOLLOWUPS_ENABLED,
    videoEnabled: env.FEATURE_VIDEO_ENABLED,
    pilotRecordingEnabled: env.FEATURE_PILOT_RECORDING_ENABLED,
    paymentOfferEnabled: env.FEATURE_PAYMENT_OFFER_ENABLED,
    reportHumanReviewRequired: env.FEATURE_REPORT_HUMAN_REVIEW_REQUIRED,
  };
}

export function hasSupabasePublicConfig(env: Env = getEnv()): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublishableKey(env));
}

export function hasLiveKitConfig(env: Env = getEnv()): boolean {
  return Boolean(
    env.NEXT_PUBLIC_LIVEKIT_URL &&
      env.LIVEKIT_API_KEY &&
      env.LIVEKIT_API_SECRET,
  );
}

export function hasOpenAIConfig(env: Env = getEnv()): boolean {
  return Boolean(env.OPENAI_API_KEY);
}
