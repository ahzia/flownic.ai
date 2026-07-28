import { z } from "zod";

const roleSchema = z.object({
  key: z.enum(["examiner", "candidate"]),
  privateGuidance: z.boolean(),
});

const followUpPolicySchema = z.object({
  enabled: z.boolean(),
  maxSuggestions: z.number().int().positive().max(5),
  allowedIntents: z.array(z.enum(["clarify", "expand", "example"])).min(1),
});

const stageSchema = z.object({
  key: z.string().min(1),
  durationSeconds: z.number().int().positive().max(1800),
  candidateInstructionKey: z.string().min(1),
  examinerInstructionKey: z.string().min(1),
  taskVariantIds: z.array(z.string()).default([]),
  followUpPolicy: followUpPolicySchema.optional(),
});

const roundSchema = z.object({
  key: z.string().min(1),
  roleAssignment: z.enum(["initial", "swapped"]),
  stages: z.array(z.string().min(1)).min(1),
});

export const blueprintSchema = z
  .object({
    schemaVersion: z.literal(1),
    trackSlug: z.literal("telc-de-b1-speaking"),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    status: z.enum(["draft", "reviewed", "active", "retired"]),
    defaultLocale: z.enum(["de", "en"]),
    supportedInstructionLocales: z.array(z.enum(["de", "en"])).min(1),
    supportedFeedbackLocales: z.array(z.enum(["de", "en"])).min(1),
    roles: z.array(roleSchema).length(2),
    rounds: z.array(roundSchema).min(1),
    stages: z.array(stageSchema).min(1),
    instructions: z.record(z.string(), z.record(z.enum(["de", "en"]), z.string())),
    rubric: z.object({
      version: z.string().min(1),
      dimensions: z.array(z.string().min(1)).min(1),
    }),
    review: z
      .object({
        reviewerReference: z.string().min(1),
        reviewedAt: z.string().datetime(),
        notes: z.string().optional(),
      })
      .optional(),
    disclaimer: z.string().min(1),
  })
  .superRefine((blueprint, ctx) => {
    const stageKeys = new Set(blueprint.stages.map((s) => s.key));
    if (stageKeys.size !== blueprint.stages.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stage keys must be unique",
        path: ["stages"],
      });
    }

    for (const round of blueprint.rounds) {
      for (const stageKey of round.stages) {
        if (!stageKeys.has(stageKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Round ${round.key} references unknown stage ${stageKey}`,
            path: ["rounds"],
          });
        }
      }
    }

    for (const stage of blueprint.stages) {
      for (const locale of blueprint.supportedInstructionLocales) {
        const candidate = blueprint.instructions[stage.candidateInstructionKey]?.[locale];
        const examiner = blueprint.instructions[stage.examinerInstructionKey]?.[locale];
        if (!candidate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Missing candidate instruction ${stage.candidateInstructionKey}.${locale}`,
            path: ["instructions"],
          });
        }
        if (!examiner) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Missing examiner instruction ${stage.examinerInstructionKey}.${locale}`,
            path: ["instructions"],
          });
        }
      }
    }
  });

export type Blueprint = z.infer<typeof blueprintSchema>;

/** Candidate-safe stage view — never includes examiner instructions or follow-up policy. */
export type CandidateStageView = {
  key: string;
  durationSeconds: number;
  instruction: string;
};

export type ExaminerStageView = {
  key: string;
  durationSeconds: number;
  instruction: string;
  followUpPolicy?: {
    enabled: boolean;
    maxSuggestions: number;
    allowedIntents: Array<"clarify" | "expand" | "example">;
  };
};

export function toCandidateStageView(
  blueprint: Blueprint,
  stageKey: string,
  locale: "de" | "en",
): CandidateStageView {
  const stage = blueprint.stages.find((s) => s.key === stageKey);
  if (!stage) throw new Error(`Unknown stage: ${stageKey}`);
  const instruction =
    blueprint.instructions[stage.candidateInstructionKey]?.[locale] ??
    blueprint.instructions[stage.candidateInstructionKey]?.[blueprint.defaultLocale];
  if (!instruction) throw new Error(`Missing candidate instruction for ${stageKey}`);
  return {
    key: stage.key,
    durationSeconds: stage.durationSeconds,
    instruction,
  };
}

export function toExaminerStageView(
  blueprint: Blueprint,
  stageKey: string,
  locale: "de" | "en",
): ExaminerStageView {
  const stage = blueprint.stages.find((s) => s.key === stageKey);
  if (!stage) throw new Error(`Unknown stage: ${stageKey}`);
  const instruction =
    blueprint.instructions[stage.examinerInstructionKey]?.[locale] ??
    blueprint.instructions[stage.examinerInstructionKey]?.[blueprint.defaultLocale];
  if (!instruction) throw new Error(`Missing examiner instruction for ${stageKey}`);
  return {
    key: stage.key,
    durationSeconds: stage.durationSeconds,
    instruction,
    followUpPolicy: stage.followUpPolicy,
  };
}
