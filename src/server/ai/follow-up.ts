import OpenAI from "openai";
import { z } from "zod";
import { getEnv, hasOpenAIConfig } from "@/shared/env";
import { loadBlueprintFromDisk } from "@/server/services/blueprint";
import {
  assertParticipant,
  getPracticeView,
} from "@/server/services/practice-session";

const followUpSchema = z.object({
  suggestions: z
    .array(
      z.object({
        intent: z.enum(["clarify", "expand", "example"]),
        text: z.string().min(1).max(280),
      }),
    )
    .min(1)
    .max(2),
});

export type FollowUpResult = z.infer<typeof followUpSchema>;

export async function requestExaminerFollowUp(input: {
  sessionId: string;
  guestKey: string;
}): Promise<FollowUpResult> {
  const view = await getPracticeView(input.sessionId, input.guestKey);
  if (!view) throw new Error("Session not found");
  if (view.yourRole !== "examiner") {
    throw new Error("Follow-ups are examiner-only");
  }
  await assertParticipant(input.sessionId, input.guestKey);

  if (!view.followUpAvailable) {
    return {
      suggestions: [
        {
          intent: "clarify",
          text: "Ask the candidate to explain one detail more clearly.",
        },
      ],
    };
  }

  const env = getEnv();
  if (!hasOpenAIConfig(env)) {
    return {
      suggestions: [
        {
          intent: "expand",
          text: "Could you give a short example from everyday life?",
        },
        {
          intent: "clarify",
          text: "What do you mean by that — can you say it another way?",
        },
      ],
    };
  }

  const blueprint = loadBlueprintFromDisk();
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: env.AI_FOLLOWUP_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You help a practice partner acting as examiner in a telc B1 speaking mock. Return JSON {\"suggestions\":[{\"intent\":\"clarify|expand|example\",\"text\":\"...\"}]} with 1-2 short spoken prompts in the session language. Never reveal scores, never claim official affiliation, never give the candidate answers.",
      },
      {
        role: "user",
        content: JSON.stringify({
          stageKey: view.stageKey,
          roundKey: view.roundKey,
          examinerInstruction: view.stageInstruction,
          track: blueprint.trackSlug,
          disclaimer: blueprint.disclaimer,
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = followUpSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return {
      suggestions: [
        {
          intent: "clarify",
          text: "Please say a bit more about your last point.",
        },
      ],
    };
  }
  return parsed.data;
}
