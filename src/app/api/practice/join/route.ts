import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  GUEST_KEY_COOKIE,
  guestCookieHeaders,
  readCookie,
} from "@/server/auth/guest";
import { joinPracticeSession } from "@/server/services/practice-session";

const bodySchema = z.object({
  inviteToken: z.string().min(8),
  displayName: z.string().trim().min(1).max(60).default("Peer"),
  ageConfirmed: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid join request." },
        { status: 400 },
      );
    }

    const existingKey = readCookie(
      request.headers.get("cookie"),
      GUEST_KEY_COOKIE,
    );
    const guestKey = existingKey ?? randomUUID();
    const { view } = joinPracticeSession({
      inviteToken: parsed.data.inviteToken,
      guestKey,
      displayName: parsed.data.displayName,
    });

    const response = NextResponse.json({ ok: true, view });
    for (const cookie of guestCookieHeaders(guestKey, parsed.data.displayName)) {
      response.headers.append("Set-Cookie", cookie);
    }
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Could not join session",
      },
      { status: 400 },
    );
  }
}
