import OpenAI from "openai";
import { z } from "zod";
import { getEnv, hasOpenAIConfig } from "@/shared/env";

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

function offlineSuggestions(starterQuestions: string[]): FollowUpResult {
  const picked = starterQuestions.slice(0, 2);
  if (picked.length === 0) {
    return {
      suggestions: [
        {
          intent: "expand",
          text: "Können Sie dazu ein kurzes Beispiel aus dem Alltag nennen?",
        },
        {
          intent: "clarify",
          text: "Was meinen Sie genau — können Sie das anders sagen?",
        },
      ],
    };
  }
  return {
    suggestions: picked.map((text, index) => ({
      intent: (index === 0 ? "clarify" : "expand") as "clarify" | "expand",
      text,
    })),
  };
}

export async function generateFollowUpFromContext(input: {
  stageKey: string | null;
  starterQuestions: string[];
  recentCandidateText: string[];
  trackSlug: string;
  disclaimer: string;
}): Promise<FollowUpResult> {
  const env = getEnv();
  if (!hasOpenAIConfig(env)) {
    return offlineSuggestions(input.starterQuestions);
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: env.AI_FOLLOWUP_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You help a practice partner acting as examiner in a Flownic telc Deutsch B1 speaking mock. Return JSON {\"suggestions\":[{\"intent\":\"clarify|expand|example\",\"text\":\"...\"}]} with 1-2 short spoken follow-up questions in German (B1 level), ready to say aloud. Build on recent candidate transcript when provided. Prefer open questions. Never reveal scores, never claim telc affiliation, never give the candidate answers or model speeches.",
      },
      {
        role: "user",
        content: JSON.stringify({
          stageKey: input.stageKey,
          starterQuestions: input.starterQuestions,
          recentCandidateText: input.recentCandidateText,
          track: input.trackSlug,
          disclaimer: input.disclaimer,
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = followUpSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    // fall through
  }
  return offlineSuggestions(input.starterQuestions);
}
