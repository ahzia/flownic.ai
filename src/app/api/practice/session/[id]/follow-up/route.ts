import { NextResponse } from "next/server";
import { GUEST_KEY_COOKIE, readCookie } from "@/server/auth/guest";
import { requestExaminerFollowUp } from "@/server/ai/follow-up";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const guestKey = readCookie(request.headers.get("cookie"), GUEST_KEY_COOKIE);
  if (!guestKey) {
    return NextResponse.json({ ok: false, error: "Missing guest session" }, { status: 401 });
  }
  try {
    const result = await requestExaminerFollowUp({
      sessionId: id,
      guestKey,
    });
    return NextResponse.json({ ok: true, ...result });
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
