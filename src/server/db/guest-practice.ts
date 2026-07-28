import type { PracticeParticipant, PracticeSessionRecord } from "@/domain/session/state";
import type { SessionMode, SessionStatus } from "@/domain/booking/types";
import type {
  FollowUpSuggestion,
  PracticeReport,
  TranscriptSegment,
} from "@/domain/session/transcript";
import { createSecretSupabaseClient } from "@/server/db/secret-client";
import {
  getEnv,
  getSupabaseSecretKey,
  hasSupabasePublicConfig,
} from "@/shared/env";

type GuestPracticeRow = {
  id: string;
  mode: SessionMode;
  status: SessionStatus;
  invite_token: string;
  host_guest_key: string;
  state_version: number;
  current_round_index: number;
  current_stage_index: number;
  stage_started_at: string | null;
  stage_ends_at: string | null;
  participants: PracticeParticipant[];
  transcript_segments?: TranscriptSegment[] | null;
  follow_up_suggestions?: FollowUpSuggestion[] | null;
  practice_report?: PracticeReport | null;
  created_at: string;
};

export function isGuestPracticeDbConfigured(): boolean {
  const env = getEnv();
  return hasSupabasePublicConfig(env) && Boolean(getSupabaseSecretKey(env));
}

function requireDb() {
  if (!isGuestPracticeDbConfigured()) {
    throw new Error(
      "Supabase is required for reliable peer practice. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY, then run the guest_practice_sessions migration.",
    );
  }
  return createSecretSupabaseClient();
}

function rowToSession(row: GuestPracticeRow): PracticeSessionRecord {
  return {
    id: row.id,
    mode: row.mode,
    status: row.status,
    inviteToken: row.invite_token,
    hostGuestKey: row.host_guest_key,
    stateVersion: row.state_version,
    currentRoundIndex: row.current_round_index,
    currentStageIndex: row.current_stage_index,
    stageStartedAt: row.stage_started_at,
    stageEndsAt: row.stage_ends_at,
    participants: row.participants,
    transcriptSegments: row.transcript_segments ?? [],
    followUpSuggestions: row.follow_up_suggestions ?? [],
    practiceReport: row.practice_report ?? null,
    createdAt: row.created_at,
  };
}

function sessionToRow(session: PracticeSessionRecord): GuestPracticeRow {
  return {
    id: session.id,
    mode: session.mode,
    status: session.status,
    invite_token: session.inviteToken,
    host_guest_key: session.hostGuestKey,
    state_version: session.stateVersion,
    current_round_index: session.currentRoundIndex,
    current_stage_index: session.currentStageIndex,
    stage_started_at: session.stageStartedAt,
    stage_ends_at: session.stageEndsAt,
    participants: session.participants,
    transcript_segments: session.transcriptSegments ?? [],
    follow_up_suggestions: session.followUpSuggestions ?? [],
    practice_report: session.practiceReport ?? null,
    created_at: session.createdAt,
  };
}

export async function insertGuestPracticeSession(
  session: PracticeSessionRecord,
): Promise<void> {
  const supabase = requireDb();
  const { error } = await supabase
    .from("guest_practice_sessions")
    .insert(sessionToRow(session));
  if (error) {
    throw new Error(`Failed to create practice session: ${error.message}`);
  }
}

export async function updateGuestPracticeSession(
  session: PracticeSessionRecord,
): Promise<void> {
  const supabase = requireDb();
  const row = sessionToRow(session);
  const { error } = await supabase
    .from("guest_practice_sessions")
    .update({
      mode: row.mode,
      status: row.status,
      state_version: row.state_version,
      current_round_index: row.current_round_index,
      current_stage_index: row.current_stage_index,
      stage_started_at: row.stage_started_at,
      stage_ends_at: row.stage_ends_at,
      participants: row.participants,
      transcript_segments: row.transcript_segments,
      follow_up_suggestions: row.follow_up_suggestions,
      practice_report: row.practice_report,
    })
    .eq("id", session.id);
  if (error) {
    throw new Error(`Failed to update practice session: ${error.message}`);
  }
}

export async function findGuestPracticeSessionById(
  id: string,
): Promise<PracticeSessionRecord | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("guest_practice_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load practice session: ${error.message}`);
  }
  return data ? rowToSession(data as GuestPracticeRow) : null;
}

export async function findGuestPracticeSessionByInvite(
  inviteToken: string,
): Promise<PracticeSessionRecord | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("guest_practice_sessions")
    .select("*")
    .eq("invite_token", inviteToken)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load invite: ${error.message}`);
  }
  return data ? rowToSession(data as GuestPracticeRow) : null;
}
