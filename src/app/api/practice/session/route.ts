import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  GUEST_KEY_COOKIE,
  guestCookieHeaders,
  readCookie,
} from "@/server/auth/guest";
import { createPracticeSession } from "@/server/services/practice-session";

const bodySchema = z.object({
  mode: z.enum(["peer", "ai_examiner"]),
  displayName: z.string().trim().min(1).max(60).default("Guest"),
  ageConfirmed: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request. Confirm you are 18+ and choose a mode.",
        },
        { status: 400 },
      );
    }

    const existingKey = readCookie(
      request.headers.get("cookie"),
      GUEST_KEY_COOKIE,
    );
    const guestKey = existingKey ?? randomUUID();
    const { view } = await createPracticeSession({
      mode: parsed.data.mode,
      hostGuestKey: guestKey,
      hostDisplayName: parsed.data.displayName,
    });

    const response = NextResponse.json({ ok: true, view });
    for (const cookie of guestCookieHeaders(
      guestKey,
      parsed.data.displayName,
    )) {
      response.headers.append("Set-Cookie", cookie);
    }
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Could not create session",
      },
      { status: 500 },
    );
  }
}
