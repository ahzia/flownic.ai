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
import { hasLiveKitConfig } from "@/shared/env";

type GlobalStore = {
  sessionsById: Map<string, PracticeSessionRecord>;
  sessionsByInvite: Map<string, string>;
};

const globalForStore = globalThis as typeof globalThis & {
  __flownicPracticeStore?: GlobalStore;
};

function store(): GlobalStore {
  if (!globalForStore.__flownicPracticeStore) {
    globalForStore.__flownicPracticeStore = {
      sessionsById: new Map(),
      sessionsByInvite: new Map(),
    };
  }
  return globalForStore.__flownicPracticeStore;
}

function opaqueToken(): string {
  return randomUUID().replace(/-/g, "");
}

export function createPracticeSession(input: {
  mode: SessionMode;
  hostGuestKey: string;
  hostDisplayName: string;
  hostRole?: SessionRole;
}): { session: PracticeSessionRecord; view: RolePrivateView } {
  const blueprint = loadBlueprintFromDisk();
  const hostRole = input.hostRole ?? (input.mode === "ai_examiner" ? "candidate" : "examiner");
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

  const s = store();
  s.sessionsById.set(session.id, session);
  s.sessionsByInvite.set(session.inviteToken, session.id);

  const view = buildRolePrivateView({
    session,
    blueprint,
    guestKey: input.hostGuestKey,
    includeInviteToken: input.mode === "peer",
    mediaReady: hasLiveKitConfig(),
  });
  if (!view) throw new Error("Failed to build host view");
  return { session, view };
}

export function joinPracticeSession(input: {
  inviteToken: string;
  guestKey: string;
  displayName: string;
}): { session: PracticeSessionRecord; view: RolePrivateView } {
  const s = store();
  const sessionId = s.sessionsByInvite.get(input.inviteToken);
  if (!sessionId) throw new Error("Invite not found");
  const session = s.sessionsById.get(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.mode !== "peer") throw new Error("This session is not peer inviteable");

  const existing = session.participants.find((p) => p.guestKey === input.guestKey);
  if (existing) {
    const blueprint = loadBlueprintFromDisk();
    const view = buildRolePrivateView({
      session,
      blueprint,
      guestKey: input.guestKey,
      mediaReady: hasLiveKitConfig(),
    });
    if (!view) throw new Error("Not a participant");
    return { session, view };
  }

  if (session.participants.filter((p) => !p.guestKey.startsWith("ai:")).length >= 2) {
    throw new Error("Session is full");
  }

  const host = session.participants[0];
  if (!host) throw new Error("Host missing");
  const peerRole: SessionRole =
    host.initialRole === "examiner" ? "candidate" : "examiner";

  session.participants.push({
    id: randomUUID(),
    guestKey: input.guestKey,
    displayName: input.displayName,
    initialRole: peerRole,
    attendance: "joined",
  });
  session.status = "in_progress";
  session.stateVersion += 1;
  s.sessionsById.set(session.id, session);

  const blueprint = loadBlueprintFromDisk();
  const view = buildRolePrivateView({
    session,
    blueprint,
    guestKey: input.guestKey,
    mediaReady: hasLiveKitConfig(),
  });
  if (!view) throw new Error("Failed to build peer view");
  return { session, view };
}

export function getPracticeView(
  sessionId: string,
  guestKey: string,
): RolePrivateView | null {
  const session = store().sessionsById.get(sessionId);
  if (!session) return null;
  const blueprint = loadBlueprintFromDisk();
  return buildRolePrivateView({
    session,
    blueprint,
    guestKey,
    includeInviteToken: session.hostGuestKey === guestKey && session.mode === "peer",
    mediaReady: hasLiveKitConfig(),
  });
}

export function getPracticeSession(sessionId: string): PracticeSessionRecord | null {
  return store().sessionsById.get(sessionId) ?? null;
}

export function transitionPracticeSession(
  sessionId: string,
  guestKey: string,
  action: "next_stage" | "complete",
): RolePrivateView {
  const session = store().sessionsById.get(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => p.guestKey === guestKey)) {
    throw new Error("Not a participant");
  }

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
  store().sessionsById.set(sessionId, next);
  const view = buildRolePrivateView({
    session: next,
    blueprint,
    guestKey,
    includeInviteToken: next.hostGuestKey === guestKey && next.mode === "peer",
    mediaReady: hasLiveKitConfig(),
  });
  if (!view) throw new Error("Not a participant");
  return view;
}

export function assertParticipant(
  sessionId: string,
  guestKey: string,
): PracticeSessionRecord {
  const session = store().sessionsById.get(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => p.guestKey === guestKey)) {
    throw new Error("Not a participant");
  }
  return session;
}
