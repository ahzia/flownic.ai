import { NextResponse } from "next/server";
import { GUEST_KEY_COOKIE, readCookie } from "@/server/auth/guest";
import { getPracticeView } from "@/server/services/practice-session";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const guestKey = readCookie(request.headers.get("cookie"), GUEST_KEY_COOKIE);
  if (!guestKey) {
    return NextResponse.json(
      { ok: false, error: "Missing guest session" },
      { status: 401 },
    );
  }
  const view = await getPracticeView(id, guestKey);
  if (!view) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, view });
}
