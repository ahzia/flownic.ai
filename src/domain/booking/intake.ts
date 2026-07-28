import { z } from "zod";
import { ASSESSMENT_TRACK_SLUG } from "@/domain/booking/types";
import { fail, newRequestId, ok, type CommandResult } from "@/shared/errors/command-result";

export const intakeSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  timezone: z.string().min(1),
  uiLocale: z.enum(["de", "en"]),
  feedbackLocale: z.enum(["de", "en"]),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  ageConfirmed: z.literal(true),
  acquisitionChannel: z.string().max(120).optional(),
  trackSlug: z.literal(ASSESSMENT_TRACK_SLUG).default(ASSESSMENT_TRACK_SLUG),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

export type IntakeResult = {
  trackSlug: typeof ASSESSMENT_TRACK_SLUG;
  profileReady: boolean;
};

export function validateIntake(raw: unknown): CommandResult<IntakeResult> {
  const requestId = newRequestId();
  const parsed = intakeSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(requestId, "VALIDATION_ERROR", "Please fix the highlighted fields.", {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    });
  }
  return ok(
    {
      trackSlug: parsed.data.trackSlug,
      profileReady: true,
    },
    requestId,
  );
}
