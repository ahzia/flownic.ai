import { randomUUID } from "node:crypto";
import type { SessionMode, SessionRole } from "@/domain/booking/types";
import { toExaminerStageView } from "@/domain/blueprint/schema";
import { loadBlueprintFromDisk } from "@/server/services/blueprint";
import {
  advanceStage,
  buildRolePrivateView,
  getStageKey,
  resolveRoleForRound,
  startStageTiming,
  type PracticeSessionRecord,
  type RolePrivateView,
} from "@/domain/session/state";
import type {
  FollowUpSuggestion,
  TranscriptSegment,
} from "@/domain/session/transcript";
import {
  findGuestPracticeSessionById,
  findGuestPracticeSessionByInvite,
  insertGuestPracticeSession,
  isGuestPracticeDbConfigured,
  updateGuestPracticeSession,
} from "@/server/db/guest-practice";
import { generateFollowUpFromContext } from "@/server/ai/follow-up";
import { generatePracticeReport } from "@/server/ai/practice-report";
import { getFeatureFlags, hasLiveKitConfig } from "@/shared/env";

function opaqueToken(): string {
  return randomUUID().replace(/-/g, "");
}

function mediaOptions() {
  const flags = getFeatureFlags();
  return {
    mediaReady: hasLiveKitConfig(),
    videoEnabled: flags.videoEnabled,
    liveTranscriptionEnabled: flags.liveTranscriptionEnabled,
  };
}

function toView(
  session: PracticeSessionRecord,
  guestKey: string,
  includeInviteToken: boolean,
): RolePrivateView {
  const blueprint = loadBlueprintFromDisk();
  const view = buildRolePrivateView({
    session,
    blueprint,
    guestKey,
    includeInviteToken,
    ...mediaOptions(),
  });
  if (!view) throw new Error("Not a participant");
  return view;
}

function emptyAiFields() {
  return {
    transcriptSegments: [] as TranscriptSegment[],
    followUpSuggestions: [] as FollowUpSuggestion[],
    practiceReport: null,
  };
}

export async function createPracticeSession(input: {
  mode: SessionMode;
  hostGuestKey: string;
  hostDisplayName: string;
  hostRole?: SessionRole;
}): Promise<{ session: PracticeSessionRecord; view: RolePrivateView }> {
  if (!isGuestPracticeDbConfigured()) {
    throw new Error(
      "Supabase is required for reliable peer practice. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY, then run the guest_practice_sessions migration (see docs/runbooks/supabase-guest-practice.md).",
    );
  }

  const blueprint = loadBlueprintFromDisk();
  const hostRole =
    input.hostRole ??
    (input.mode === "ai_examiner" ? "candidate" : "examiner");
  const firstStage = getStageKey(blueprint, 0, 0);
  const timing = firstStage
    ? startStageTiming(blueprint, firstStage)
    : { stageStartedAt: null, stageEndsAt: null };

  const session: PracticeSessionRecord = {
    id: randomUUID(),
    mode: input.mode,
    status: input.mode === "peer" ? "waiting" : "in_progress",
    inviteToken: opaqueToken(),
    hostGuestKey: input.hostGuestKey,
    stateVersion: 1,
    currentRoundIndex: 0,
    currentStageIndex: 0,
    stageStartedAt: timing.stageStartedAt,
    stageEndsAt: timing.stageEndsAt,
    createdAt: new Date().toISOString(),
    participants: [
      {
        id: randomUUID(),
        guestKey: input.hostGuestKey,
        displayName: input.hostDisplayName,
        initialRole: hostRole,
        attendance: "joined",
      },
    ],
    ...emptyAiFields(),
  };

  if (input.mode === "ai_examiner") {
    session.participants.push({
      id: randomUUID(),
      guestKey: `ai:${session.id}`,
      displayName: "AI Examiner",
      initialRole: hostRole === "candidate" ? "examiner" : "candidate",
      attendance: "joined",
    });
  }

  await insertGuestPracticeSession(session);

  return {
    session,
    view: toView(session, input.hostGuestKey, input.mode === "peer"),
  };
}

export async function joinPracticeSession(input: {
  inviteToken: string;
  guestKey: string;
  displayName: string;
}): Promise<{ session: PracticeSessionRecord; view: RolePrivateView }> {
  const session = await findGuestPracticeSessionByInvite(input.inviteToken);
  if (!session) throw new Error("Invite not found");
  if (session.mode !== "peer") {
    throw new Error("This session is not peer inviteable");
  }

  const existing = session.participants.find(
    (p) => p.guestKey === input.guestKey,
  );
  if (existing) {
    return { session, view: toView(session, input.guestKey, false) };
  }

  if (
    session.participants.filter((p) => !p.guestKey.startsWith("ai:")).length >=
    2
  ) {
    throw new Error("Session is full");
  }

  const host = session.participants[0];
  if (!host) throw new Error("Host missing");
  const peerRole: SessionRole =
    host.initialRole === "examiner" ? "candidate" : "examiner";

  const next: PracticeSessionRecord = {
    ...session,
    status: "in_progress",
    stateVersion: session.stateVersion + 1,
    participants: [
      ...session.participants,
      {
        id: randomUUID(),
        guestKey: input.guestKey,
        displayName: input.displayName,
        initialRole: peerRole,
        attendance: "joined",
      },
    ],
  };

  await updateGuestPracticeSession(next);
  return { session: next, view: toView(next, input.guestKey, false) };
}

export async function getPracticeView(
  sessionId: string,
  guestKey: string,
): Promise<RolePrivateView | null> {
  if (!isGuestPracticeDbConfigured()) return null;
  const session = await findGuestPracticeSessionById(sessionId);
  if (!session) return null;
  try {
    return toView(
      session,
      guestKey,
      session.hostGuestKey === guestKey && session.mode === "peer",
    );
  } catch {
    return null;
  }
}

export async function getPracticeSession(
  sessionId: string,
): Promise<PracticeSessionRecord | null> {
  if (!isGuestPracticeDbConfigured()) return null;
  return findGuestPracticeSessionById(sessionId);
}

export async function appendTranscriptSegment(input: {
  sessionId: string;
  guestKey: string;
  text: string;
  source: "speech" | "mock";
}): Promise<RolePrivateView> {
  const session = await assertParticipant(input.sessionId, input.guestKey);
  if (session.status !== "in_progress" && session.status !== "waiting") {
    throw new Error("Session is not accepting transcript");
  }

  const blueprint = loadBlueprintFromDisk();
  const you = session.participants.find((p) => p.guestKey === input.guestKey)!;
  const role = resolveRoleForRound(
    you.initialRole,
    session.currentRoundIndex,
    blueprint,
  );
  if (role !== "candidate") {
    throw new Error("Only the candidate can post transcript segments");
  }

  const text = input.text.trim().slice(0, 1000);
  if (!text) throw new Error("Empty transcript");

  const stageKey = getStageKey(
    blueprint,
    session.currentRoundIndex,
    session.currentStageIndex,
  );

  const segment: TranscriptSegment = {
    id: randomUUID(),
    speakerRole: "candidate",
    participantId: you.id,
    stageKey,
    text,
    createdAt: new Date().toISOString(),
    source: input.source,
  };

  const segments = [...(session.transcriptSegments ?? []), segment].slice(-80);
  let next: PracticeSessionRecord = {
    ...session,
    transcriptSegments: segments,
    stateVersion: session.stateVersion + 1,
  };

  const flags = getFeatureFlags();
  if (flags.examinerFollowupsEnabled) {
    const starterQuestions =
      stageKey != null
        ? toExaminerStageView(blueprint, stageKey, blueprint.defaultLocale)
            .starterQuestions
        : [];
    const suggestions = await generateFollowUpFromContext({
      stageKey,
      starterQuestions,
      recentCandidateText: segments
        .filter((s) => s.speakerRole === "candidate")
        .slice(-4)
        .map((s) => s.text),
      trackSlug: blueprint.trackSlug,
      disclaimer: blueprint.disclaimer,
    });
    next = {
      ...next,
      followUpSuggestions: suggestions.suggestions,
    };
  }

  await updateGuestPracticeSession(next);
  return toView(
    next,
    input.guestKey,
    next.hostGuestKey === input.guestKey && next.mode === "peer",
  );
}

export async function refreshFollowUps(
  sessionId: string,
  guestKey: string,
): Promise<RolePrivateView> {
  const session = await assertParticipant(sessionId, guestKey);
  const blueprint = loadBlueprintFromDisk();
  const you = session.participants.find((p) => p.guestKey === guestKey)!;
  const role = resolveRoleForRound(
    you.initialRole,
    session.currentRoundIndex,
    blueprint,
  );
  if (role !== "examiner") {
    throw new Error("Follow-ups are examiner-only");
  }

  const stageKey = getStageKey(
    blueprint,
    session.currentRoundIndex,
    session.currentStageIndex,
  );
  const starterQuestions =
    stageKey != null
      ? toExaminerStageView(blueprint, stageKey, blueprint.defaultLocale)
          .starterQuestions
      : [];

  const suggestions = await generateFollowUpFromContext({
    stageKey,
    starterQuestions,
    recentCandidateText: (session.transcriptSegments ?? [])
      .filter((s) => s.speakerRole === "candidate")
      .slice(-4)
      .map((s) => s.text),
    trackSlug: blueprint.trackSlug,
    disclaimer: blueprint.disclaimer,
  });

  const next: PracticeSessionRecord = {
    ...session,
    followUpSuggestions: suggestions.suggestions,
    stateVersion: session.stateVersion + 1,
  };
  await updateGuestPracticeSession(next);
  return toView(
    next,
    guestKey,
    next.hostGuestKey === guestKey && next.mode === "peer",
  );
}

export async function transitionPracticeSession(
  sessionId: string,
  guestKey: string,
  action: "next_stage" | "complete",
): Promise<RolePrivateView> {
  const session = await assertParticipant(sessionId, guestKey);
  const blueprint = loadBlueprintFromDisk();
  let next = session;
  if (action === "next_stage") {
    next = {
      ...advanceStage(session, blueprint),
      followUpSuggestions: [],
    };
  } else {
    next = {
      ...session,
      status: "processing",
      stateVersion: session.stateVersion + 1,
      stageStartedAt: null,
      stageEndsAt: null,
    };
    await updateGuestPracticeSession(next);

    const report = await generatePracticeReport({
      segments: session.transcriptSegments ?? [],
      stageKeys: blueprint.stages.map((s) => s.key),
      trackSlug: blueprint.trackSlug,
      disclaimer: blueprint.disclaimer,
    });

    next = {
      ...next,
      status: "completed",
      practiceReport: report,
      stateVersion: next.stateVersion + 1,
    };
  }
  await updateGuestPracticeSession(next);
  return toView(
    next,
    guestKey,
    next.hostGuestKey === guestKey && next.mode === "peer",
  );
}

export async function assertParticipant(
  sessionId: string,
  guestKey: string,
): Promise<PracticeSessionRecord> {
  const session = await findGuestPracticeSessionById(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => p.guestKey === guestKey)) {
    throw new Error("Not a participant");
  }
  return session;
}
