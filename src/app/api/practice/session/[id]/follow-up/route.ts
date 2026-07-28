import { NextResponse } from "next/server";
import { GUEST_KEY_COOKIE, readCookie } from "@/server/auth/guest";
import { refreshFollowUps } from "@/server/services/practice-session";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const guestKey = readCookie(request.headers.get("cookie"), GUEST_KEY_COOKIE);
  if (!guestKey) {
    return NextResponse.json({ ok: false, error: "Missing guest session" }, { status: 401 });
  }
  try {
    const view = await refreshFollowUps(id, guestKey);
    return NextResponse.json({
      ok: true,
      suggestions: view.followUpSuggestions,
      view,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Follow-up failed",
      },
      { status: 400 },
    );
  }
}
