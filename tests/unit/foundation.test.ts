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
    const candidate = toCandidateStageView(blueprint, "intro", "de");
    const examiner = toExaminerStageView(blueprint, "intro", "de");
    expect(candidate.instruction).toContain("Stellen Sie sich kurz vor");
    expect(examiner.instruction).toContain("Sie führen Teil 1");
    expect(examiner.starterQuestions.length).toBeGreaterThan(0);
    expect(candidate.instruction).not.toContain("der Partner sieht sie nicht");
    expect(examiner.instruction).toContain("der Partner sieht sie nicht");
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
      currentStageIndex: 0,
      stageStartedAt: new Date().toISOString(),
      stageEndsAt: new Date(Date.now() + 60000).toISOString(),
      createdAt: new Date().toISOString(),
      transcriptSegments: [
        {
          id: "seg1",
          speakerRole: "candidate",
          participantId: "p2",
          stageKey: "intro",
          text: "Ich heiße Peer und komme aus Berlin.",
          createdAt: new Date().toISOString(),
          source: "mock",
        },
      ],
      followUpSuggestions: [
        { intent: "expand", text: "Können Sie mehr über Berlin erzählen?" },
      ],
      practiceReport: null,
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
      videoEnabled: true,
    });
    const candidateView = buildRolePrivateView({
      session,
      blueprint,
      guestKey: "peer",
      videoEnabled: true,
    });

    expect(examinerView?.yourRole).toBe("examiner");
    expect(candidateView?.yourRole).toBe("candidate");
    expect(examinerView?.stageTitle).toContain("Teil 1");
    expect(examinerView?.stageInstruction).toContain("Sie führen Teil 1");
    expect(examinerView?.starterQuestions[0]).toContain("Wie heißen Sie");
    expect(candidateView?.stageInstruction).toContain("Stellen Sie sich kurz vor");
    expect(candidateView?.starterQuestions).toEqual([]);
    expect(candidateView?.followUpAvailable).toBe(false);
    expect(examinerView?.followUpAvailable).toBe(true);
    expect(examinerView?.videoEnabled).toBe(true);
    expect(examinerView?.followUpSuggestions).toHaveLength(1);
    expect(candidateView?.followUpSuggestions).toEqual([]);
    expect(examinerView?.recentTranscript[0]?.text).toContain("Berlin");
    expect(candidateView?.recentTranscript[0]?.text).toContain("Berlin");

    const advanced = advanceStage(session, blueprint);
    expect(advanced.currentStageIndex).toBe(1);
  });
});

describe("practice report safety", () => {
  it("rejects prohibited official-score claims", async () => {
    const { assertPracticeFeedbackSafe, practiceReportSchema } = await import(
      "@/domain/session/transcript"
    );
    const report = practiceReportSchema.parse({
      schemaVersion: 1,
      feedbackLocale: "en",
      overallSummary: "You have a 90% pass probability for telc.",
      strengths: [],
      corrections: [],
      rubricObservations: [
        {
          dimension: "fluency",
          observation: "ok",
          band: "developing",
          confidence: "low",
          evidenceSegmentIds: [],
        },
      ],
      nextPracticeFocus: { title: "Practice", action: "Speak more" },
      limitations: [],
    });
    expect(() => assertPracticeFeedbackSafe(report)).toThrow(/prohibited/i);
  });
});

describe("follow-up offline fallback", () => {
  it("uses starter questions when OpenAI is unset", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const { generateFollowUpFromContext } = await import(
      "@/server/ai/follow-up"
    );
    const { getEnv } = await import("@/shared/env");
    getEnv(true);

    const result = await generateFollowUpFromContext({
      stageKey: "intro",
      starterQuestions: [
        "Wie heißen Sie und woher kommen Sie?",
        "Welche Hobbys haben Sie?",
      ],
      recentCandidateText: ["Ich komme aus Berlin."],
      trackSlug: "telc-de-b1-speaking",
      disclaimer: "practice only",
    });

    expect(result.suggestions).toHaveLength(2);
    expect(result.suggestions[0]?.text).toContain("Wie heißen Sie");
    expect(result.suggestions[1]?.text).toContain("Hobbys");

    if (prev !== undefined) process.env.OPENAI_API_KEY = prev;
    getEnv(true);
  });
});
