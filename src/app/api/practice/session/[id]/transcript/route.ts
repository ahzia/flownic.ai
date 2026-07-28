import { NextResponse } from "next/server";
import { z } from "zod";
import { GUEST_KEY_COOKIE, readCookie } from "@/server/auth/guest";
import { appendTranscriptSegment } from "@/server/services/practice-session";

const bodySchema = z.object({
  text: z.string().min(1).max(1000),
  source: z.enum(["speech", "mock"]).default("speech"),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const guestKey = readCookie(request.headers.get("cookie"), GUEST_KEY_COOKIE);
  if (!guestKey) {
    return NextResponse.json(
      { ok: false, error: "Missing guest session" },
      { status: 401 },
    );
  }
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid transcript payload" },
        { status: 400 },
      );
    }
    const view = await appendTranscriptSegment({
      sessionId: id,
      guestKey,
      text: parsed.data.text,
      source: parsed.data.source,
    });
    return NextResponse.json({ ok: true, view });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Transcript failed",
      },
      { status: 400 },
    );
  }
}
