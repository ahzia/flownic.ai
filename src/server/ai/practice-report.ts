import OpenAI from "openai";
import { getEnv, hasOpenAIConfig } from "@/shared/env";
import {
  assertPracticeFeedbackSafe,
  practiceReportSchema,
  type PracticeReport,
  type TranscriptSegment,
} from "@/domain/session/transcript";

function mockReport(segments: TranscriptSegment[]): PracticeReport {
  const ids = segments.slice(-6).map((s) => s.id);
  const wordCount = segments.reduce(
    (sum, s) => sum + s.text.trim().split(/\s+/).filter(Boolean).length,
    0,
  );
  const coverageLimitation =
    segments.length < 2
      ? "Little transcript evidence was available; observations are limited."
      : segments.every((s) => s.source === "mock")
        ? "Transcript used demo/mock speech — treat marks as illustrative only."
        : "Practice guidance only — not an official telc score or pass prediction.";

  const fluencyBand =
    wordCount > 80 ? "solid" : wordCount > 30 ? "developing" : "needs_work";

  const report: PracticeReport = {
    schemaVersion: 1,
    feedbackLocale: "de",
    overallSummary:
      wordCount > 30
        ? "You produced enough spoken practice for useful feedback. Keep answering in full sentences and reacting to your partner."
        : "Transcript coverage was thin. Speak a bit longer next time so feedback can cite more of what you said.",
    strengths: [
      {
        claim:
          wordCount > 20
            ? "You contributed audible turns that can be used for practice feedback."
            : "You started the speaking task — continue with longer answers.",
        evidenceSegmentIds: ids.slice(0, 2),
      },
    ],
    corrections: [],
    rubricObservations: [
      {
        dimension: "task_completion",
        observation:
          "Stay on the stage task (intro / topic / planning) and finish with a clear decision when planning.",
        band: fluencyBand === "needs_work" ? "needs_work" : "developing",
        confidence: segments.length >= 2 ? "medium" : "low",
        evidenceSegmentIds: ids.slice(0, 2),
      },
      {
        dimension: "fluency",
        observation:
          fluencyBand === "solid"
            ? "You kept speaking with usable length for B1 practice."
            : "Aim for slightly longer turns with linking words (und, weil, deshalb).",
        band: fluencyBand,
        confidence: segments.length >= 3 ? "medium" : "low",
        evidenceSegmentIds: ids,
      },
      {
        dimension: "interaction",
        observation:
          "Ask at least one question back each stage so the dialogue stays reciprocal.",
        band: "developing",
        confidence: "low",
        evidenceSegmentIds: ids.slice(-1),
      },
    ],
    nextPracticeFocus: {
      title: "Longer answers + one follow-up question",
      action:
        "In the next round, answer in 3–4 sentences, then ask your partner one open question.",
    },
    limitations: [coverageLimitation],
  };

  return practiceReportSchema.parse(report);
}

export async function generatePracticeReport(input: {
  segments: TranscriptSegment[];
  stageKeys: string[];
  trackSlug: string;
  disclaimer: string;
}): Promise<PracticeReport> {
  const env = getEnv();
  if (!hasOpenAIConfig(env) || input.segments.length === 0) {
    const report = mockReport(input.segments);
    assertPracticeFeedbackSafe(report);
    return report;
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: env.AI_FEEDBACK_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write Flownic practice feedback for telc Deutsch B1 speaking mocks. Return JSON matching {schemaVersion:1,feedbackLocale:'de'|'en',overallSummary,strengths[{claim,evidenceSegmentIds}],corrections[{observedText,suggestedText,explanation,evidenceSegmentIds}],rubricObservations[{dimension,observation,band:'needs_work'|'developing'|'solid',confidence:'low'|'medium'|'high',evidenceSegmentIds}],nextPracticeFocus:{title,action},limitations[]}. Cite only provided segment ids. Never invent quotes. Never give official scores, pass probability, or telc affiliation. Phrase as practice guidance. band is a rough practice mark only.",
      },
      {
        role: "user",
        content: JSON.stringify({
          track: input.trackSlug,
          disclaimer: input.disclaimer,
          stageKeys: input.stageKeys,
          segments: input.segments.map((s) => ({
            id: s.id,
            stageKey: s.stageKey,
            text: s.text,
            source: s.source,
          })),
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = practiceReportSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      assertPracticeFeedbackSafe(parsed.data);
      return parsed.data;
    }
  } catch {
    // fall through
  }
  const report = mockReport(input.segments);
  assertPracticeFeedbackSafe(report);
  return report;
}
