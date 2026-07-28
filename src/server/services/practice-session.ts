import { randomUUID } from "node:crypto";
import type { SessionMode, SessionRole } from "@/domain/booking/types";
import { loadBlueprintFromDisk } from "@/server/services/blueprint";
import {
  advanceStage,
  buildRolePrivateView,
  getStageKey,
  startStageTiming,
  type PracticeSessionRecord,
  type RolePrivateView,
} from "@/domain/session/state";
import {
  findGuestPracticeSessionById,
  findGuestPracticeSessionByInvite,
  insertGuestPracticeSession,
  isGuestPracticeDbConfigured,
  updateGuestPracticeSession,
} from "@/server/db/guest-practice";
import { getFeatureFlags, hasLiveKitConfig } from "@/shared/env";

function opaqueToken(): string {
  return randomUUID().replace(/-/g, "");
}

function mediaOptions() {
  const flags = getFeatureFlags();
  return {
    mediaReady: hasLiveKitConfig(),
    videoEnabled: flags.videoEnabled,
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

export async function transitionPracticeSession(
  sessionId: string,
  guestKey: string,
  action: "next_stage" | "complete",
): Promise<RolePrivateView> {
  const session = await assertParticipant(sessionId, guestKey);
  const blueprint = loadBlueprintFromDisk();
  let next = session;
  if (action === "next_stage") {
    next = advanceStage(session, blueprint);
  } else {
    next = {
      ...session,
      status: "completed",
      stateVersion: session.stateVersion + 1,
      stageStartedAt: null,
      stageEndsAt: null,
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
