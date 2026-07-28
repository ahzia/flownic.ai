import { z } from "zod";

export const transcriptSegmentSchema = z.object({
  id: z.string().min(1),
  speakerRole: z.enum(["examiner", "candidate"]),
  participantId: z.string().min(1),
  stageKey: z.string().nullable(),
  text: z.string().min(1).max(1000),
  createdAt: z.string().datetime(),
  source: z.enum(["speech", "mock"]),
});

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;

export const followUpSuggestionSchema = z.object({
  intent: z.enum(["clarify", "expand", "example"]),
  text: z.string().min(1).max(280),
});

export type FollowUpSuggestion = z.infer<typeof followUpSuggestionSchema>;

export const practiceReportSchema = z.object({
  schemaVersion: z.literal(1),
  feedbackLocale: z.enum(["de", "en"]),
  overallSummary: z.string().min(1).max(1200),
  strengths: z
    .array(
      z.object({
        claim: z.string().min(1).max(400),
        evidenceSegmentIds: z.array(z.string()).default([]),
      }),
    )
    .max(5),
  corrections: z
    .array(
      z.object({
        observedText: z.string().min(1).max(400),
        suggestedText: z.string().min(1).max(400),
        explanation: z.string().min(1).max(500),
        evidenceSegmentIds: z.array(z.string()).default([]),
      }),
    )
    .max(5),
  rubricObservations: z
    .array(
      z.object({
        dimension: z.string().min(1),
        observation: z.string().min(1).max(500),
        band: z.enum(["needs_work", "developing", "solid"]),
        confidence: z.enum(["low", "medium", "high"]),
        evidenceSegmentIds: z.array(z.string()).default([]),
      }),
    )
    .min(1)
    .max(8),
  nextPracticeFocus: z.object({
    title: z.string().min(1).max(120),
    action: z.string().min(1).max(400),
  }),
  limitations: z.array(z.string().min(1).max(300)).max(6),
});

export type PracticeReport = z.infer<typeof practiceReportSchema>;

const PROHIBITED =
  /\b(official\s+score|pass\s+probability|telc\s+pass|guaranteed\s+pass|bereit?\s*%|offizielle[nr]?\s+(note|punkt))/i;

export function assertPracticeFeedbackSafe(report: PracticeReport): void {
  const blobs = [
    report.overallSummary,
    report.nextPracticeFocus.title,
    report.nextPracticeFocus.action,
    ...report.strengths.map((s) => s.claim),
    ...report.corrections.flatMap((c) => [
      c.observedText,
      c.suggestedText,
      c.explanation,
    ]),
    ...report.rubricObservations.map((r) => r.observation),
    ...report.limitations,
  ];
  for (const text of blobs) {
    if (PROHIBITED.test(text)) {
      throw new Error("Practice report contains prohibited official-score claims");
    }
  }
}
