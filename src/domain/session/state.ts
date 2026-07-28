import type { SessionMode, SessionRole, SessionStatus } from "@/domain/booking/types";
import type { Blueprint } from "@/domain/blueprint/schema";
import {
  toCandidateStageView,
  toExaminerStageView,
} from "@/domain/blueprint/schema";

export type PracticeParticipant = {
  id: string;
  guestKey: string;
  displayName: string;
  initialRole: SessionRole;
  attendance: "expected" | "joined" | "ready" | "left";
};

export type PracticeSessionRecord = {
  id: string;
  mode: SessionMode;
  status: SessionStatus;
  inviteToken: string;
  hostGuestKey: string;
  stateVersion: number;
  currentRoundIndex: number;
  currentStageIndex: number;
  stageStartedAt: string | null;
  stageEndsAt: string | null;
  participants: PracticeParticipant[];
  createdAt: string;
};

export function canTransition(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  const allowed: Record<SessionStatus, SessionStatus[]> = {
    scheduled: ["waiting", "cancelled", "failed"],
    waiting: ["in_progress", "cancelled", "failed"],
    in_progress: ["processing", "failed", "cancelled"],
    processing: ["completed", "failed"],
    completed: [],
    failed: [],
    cancelled: [],
  };
  return allowed[from].includes(to);
}

export function getRound(blueprint: Blueprint, roundIndex: number) {
  return blueprint.rounds[roundIndex] ?? null;
}

export function getStageKey(
  blueprint: Blueprint,
  roundIndex: number,
  stageIndex: number,
): string | null {
  const round = getRound(blueprint, roundIndex);
  if (!round) return null;
  return round.stages[stageIndex] ?? null;
}

export function resolveRoleForRound(
  initialRole: SessionRole,
  roundIndex: number,
  blueprint: Blueprint,
): SessionRole {
  const round = getRound(blueprint, roundIndex);
  if (!round) return initialRole;
  if (round.roleAssignment === "swapped") {
    return initialRole === "examiner" ? "candidate" : "examiner";
  }
  return initialRole;
}

export function startStageTiming(
  blueprint: Blueprint,
  stageKey: string,
  now = new Date(),
): { stageStartedAt: string; stageEndsAt: string } {
  const stage = blueprint.stages.find((s) => s.key === stageKey);
  const durationSeconds = stage?.durationSeconds ?? 60;
  const ends = new Date(now.getTime() + durationSeconds * 1000);
  return {
    stageStartedAt: now.toISOString(),
    stageEndsAt: ends.toISOString(),
  };
}

export function advanceStage(
  session: PracticeSessionRecord,
  blueprint: Blueprint,
): PracticeSessionRecord {
  const round = getRound(blueprint, session.currentRoundIndex);
  if (!round) return session;

  const nextStageIndex = session.currentStageIndex + 1;
  if (nextStageIndex < round.stages.length) {
    const stageKey = round.stages[nextStageIndex]!;
    const timing = startStageTiming(blueprint, stageKey);
    return {
      ...session,
      currentStageIndex: nextStageIndex,
      stateVersion: session.stateVersion + 1,
      ...timing,
    };
  }

  const nextRoundIndex = session.currentRoundIndex + 1;
  if (nextRoundIndex < blueprint.rounds.length) {
    const nextRound = blueprint.rounds[nextRoundIndex]!;
    const stageKey = nextRound.stages[0]!;
    const timing = startStageTiming(blueprint, stageKey);
    return {
      ...session,
      currentRoundIndex: nextRoundIndex,
      currentStageIndex: 0,
      stateVersion: session.stateVersion + 1,
      ...timing,
    };
  }

  return {
    ...session,
    status: "processing",
    stateVersion: session.stateVersion + 1,
    stageStartedAt: null,
    stageEndsAt: null,
  };
}

export type RolePrivateView = {
  sessionId: string;
  mode: SessionMode;
  status: SessionStatus;
  stateVersion: number;
  yourRole: SessionRole;
  yourParticipantId: string;
  peerDisplayName: string | null;
  roundKey: string | null;
  stageKey: string | null;
  stageStartedAt: string | null;
  stageEndsAt: string | null;
  stageInstruction: string | null;
  followUpAvailable: boolean;
  inviteToken: string | null;
  mediaReady: boolean;
};

export function buildRolePrivateView(options: {
  session: PracticeSessionRecord;
  blueprint: Blueprint;
  guestKey: string;
  locale?: "de" | "en";
  includeInviteToken?: boolean;
  mediaReady?: boolean;
}): RolePrivateView | null {
  const {
    session,
    blueprint,
    guestKey,
    locale = "en",
    includeInviteToken = false,
    mediaReady = false,
  } = options;

  const you = session.participants.find((p) => p.guestKey === guestKey);
  if (!you) return null;

  const yourRole = resolveRoleForRound(
    you.initialRole,
    session.currentRoundIndex,
    blueprint,
  );
  const peer = session.participants.find((p) => p.guestKey !== guestKey);
  const round = getRound(blueprint, session.currentRoundIndex);
  const stageKey = getStageKey(
    blueprint,
    session.currentRoundIndex,
    session.currentStageIndex,
  );

  let stageInstruction: string | null = null;
  let followUpAvailable = false;

  if (stageKey) {
    if (yourRole === "examiner") {
      const view = toExaminerStageView(blueprint, stageKey, locale);
      stageInstruction = view.instruction;
      followUpAvailable = Boolean(view.followUpPolicy?.enabled);
    } else {
      const view = toCandidateStageView(blueprint, stageKey, locale);
      stageInstruction = view.instruction;
    }
  }

  return {
    sessionId: session.id,
    mode: session.mode,
    status: session.status,
    stateVersion: session.stateVersion,
    yourRole,
    yourParticipantId: you.id,
    peerDisplayName: peer?.displayName ?? null,
    roundKey: round?.key ?? null,
    stageKey,
    stageStartedAt: session.stageStartedAt,
    stageEndsAt: session.stageEndsAt,
    stageInstruction,
    followUpAvailable: yourRole === "examiner" ? followUpAvailable : false,
    inviteToken: includeInviteToken ? session.inviteToken : null,
    mediaReady,
  };
}
