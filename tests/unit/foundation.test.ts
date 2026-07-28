import { describe, expect, it } from "vitest";
import {
  envSchema,
  getFeatureFlags,
  getSupabasePublishableKey,
  getSupabaseSecretKey,
} from "@/shared/env";
import { validateIntake } from "@/domain/booking/intake";
import {
  advanceStage,
  buildRolePrivateView,
  canTransition,
  type PracticeSessionRecord,
} from "@/domain/session/state";
import {
  blueprintSchema,
  toCandidateStageView,
  toExaminerStageView,
} from "@/domain/blueprint/schema";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("env schema", () => {
  it("parses defaults and feature flags", () => {
    const env = envSchema.parse({
      FEATURE_PEER_SESSIONS_ENABLED: "true",
      FEATURE_AI_FALLBACK_ENABLED: "1",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      SUPABASE_SECRET_KEY: "sb_secret_test",
    });
    const flags = getFeatureFlags(env);
    expect(flags.peerSessionsEnabled).toBe(true);
    expect(flags.aiFallbackEnabled).toBe(true);
    expect(getSupabasePublishableKey(env)).toBe("sb_publishable_test");
    expect(getSupabaseSecretKey(env)).toBe("sb_secret_test");
  });

  it("accepts typo secret key alias", () => {
    const env = envSchema.parse({
      SuPABASE_SECRET_KEY: "sb_secret_typo",
    });
    expect(getSupabaseSecretKey(env)).toBe("sb_secret_typo");
  });

  it("treats blank optional provider env as unset", () => {
    const env = envSchema.parse({
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
      SENTRY_DSN: "",
      PAYMENT_LINK_URL: "",
    });
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.EMAIL_FROM).toBeUndefined();
    expect(env.SENTRY_DSN).toBeUndefined();
    expect(env.PAYMENT_LINK_URL).toBeUndefined();
  });
});

describe("intake validation", () => {
  it("accepts a complete adult intake", () => {
    const result = validateIntake({
      displayName: "Amina",
      timezone: "Europe/Berlin",
      uiLocale: "de",
      feedbackLocale: "de",
      examDate: "2026-09-15",
      ageConfirmed: true,
    });
    expect(result.ok).toBe(true);
  });
});

describe("session transitions", () => {
  it("allows waiting -> in_progress", () => {
    expect(canTransition("waiting", "in_progress")).toBe(true);
  });
});

describe("blueprint role privacy", () => {
  const raw = JSON.parse(
    readFileSync(
      resolve(process.cwd(), "content/blueprints/telc-de-b1-speaking/blueprint.json"),
      "utf8",
    ),
  );
  const blueprint = blueprintSchema.parse(raw);

  it("keeps examiner instructions out of candidate views", () => {
    const candidate = toCandidateStageView(blueprint, "task-1", "en");
    const examiner = toExaminerStageView(blueprint, "task-1", "en");
    expect(candidate.instruction).not.toContain("Never show these cues");
    expect(examiner.instruction).toContain("Never show these cues");
  });

  it("filters role-private payloads by participant", () => {
    const session: PracticeSessionRecord = {
      id: "s1",
      mode: "peer",
      status: "in_progress",
      inviteToken: "tok",
      hostGuestKey: "host",
      stateVersion: 1,
      currentRoundIndex: 0,
      currentStageIndex: 1,
      stageStartedAt: new Date().toISOString(),
      stageEndsAt: new Date(Date.now() + 60000).toISOString(),
      createdAt: new Date().toISOString(),
      participants: [
        {
          id: "p1",
          guestKey: "host",
          displayName: "Host",
          initialRole: "examiner",
          attendance: "joined",
        },
        {
          id: "p2",
          guestKey: "peer",
          displayName: "Peer",
          initialRole: "candidate",
          attendance: "joined",
        },
      ],
    };

    const examinerView = buildRolePrivateView({
      session,
      blueprint,
      guestKey: "host",
    });
    const candidateView = buildRolePrivateView({
      session,
      blueprint,
      guestKey: "peer",
    });

    expect(examinerView?.yourRole).toBe("examiner");
    expect(candidateView?.yourRole).toBe("candidate");
    expect(examinerView?.stageInstruction).toContain("Never show these cues");
    expect(candidateView?.stageInstruction).not.toContain("Never show these cues");
    expect(candidateView?.followUpAvailable).toBe(false);
    expect(examinerView?.followUpAvailable).toBe(true);

    const advanced = advanceStage(session, blueprint);
    expect(advanced.currentStageIndex).toBe(2);
  });
});
