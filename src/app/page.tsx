import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <section className="animate-fade-in grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gradient">
          telc Deutsch B1 speaking
        </p>
        <h1 className="max-w-xl font-[family-name:var(--font-display)] text-4xl leading-[1.1] font-semibold md:text-5xl">
          Practice the conversation before it counts
        </h1>
        <p className="max-w-xl text-lg text-[var(--color-muted)]">
          Flownic runs a realistic peer speaking session: private examiner
          guidance, timed stages, role switching, and AI follow-up cues when you
          need them.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/practice" className="no-underline">
            <Button type="button">
              Start practicing
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/login" className="no-underline">
            <Button type="button" variant="secondary">
              Sign in with email
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3">
        <Card className="flex gap-3">
          <Users className="mt-0.5 shrink-0 text-[var(--color-brand-violet)]" />
          <div>
            <h2 className="font-semibold">Invite a peer</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Share one link. Each of you gets a different role screen.
            </p>
          </div>
        </Card>
        <Card className="flex gap-3">
          <Bot className="mt-0.5 shrink-0 text-[var(--color-examiner)]" />
          <div>
            <h2 className="font-semibold">Or practice with AI</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Solo mode with examiner guidance and follow-up suggestions.
            </p>
          </div>
        </Card>
        <Card className="flex gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-[var(--color-success)]" />
          <div>
            <h2 className="font-semibold">Role privacy first</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Examiner cues stay off the candidate screen — by design.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
