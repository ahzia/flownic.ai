import { NextResponse } from "next/server";
import { GUEST_KEY_COOKIE, readCookie } from "@/server/auth/guest";
import { issueLiveKitToken } from "@/server/livekit/adapter";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const guestKey = readCookie(request.headers.get("cookie"), GUEST_KEY_COOKIE);
  if (!guestKey) {
    return NextResponse.json({ ok: false, error: "Missing guest session" }, { status: 401 });
  }
  try {
    const grant = await issueLiveKitToken({ sessionId: id, guestKey });
    return NextResponse.json({ ok: true, grant });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "LiveKit unavailable",
      },
      { status: 400 },
    );
  }
}
