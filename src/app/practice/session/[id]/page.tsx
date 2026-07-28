import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PracticeSessionClient } from "@/features/live-session/practice-session-client";
import { GUEST_KEY_COOKIE } from "@/server/auth/guest";
import { getPracticeView } from "@/server/services/practice-session";

type Props = { params: Promise<{ id: string }> };

export default async function PracticeSessionPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const guestKey = cookieStore.get(GUEST_KEY_COOKIE)?.value;
  if (!guestKey) {
    redirect("/practice");
  }

  const view = getPracticeView(id, guestKey);
  if (!view) {
    redirect("/practice");
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Live practice
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          telc B1 speaking session
        </h1>
      </div>
      <PracticeSessionClient sessionId={id} initialView={view} />
    </section>
  );
}
