import { PracticeHubClient } from "@/features/live-session/practice-hub-client";

export default function PracticePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-gradient">
          telc Deutsch B1 speaking
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
          Start your speaking practice
        </h1>
        <p className="max-w-2xl text-[var(--color-muted)]">
          No account required to begin. Confirm you are 18+, then invite a peer
          or practice with AI.
        </p>
      </div>
      <PracticeHubClient />
    </section>
  );
}
