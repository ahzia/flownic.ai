"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Bot, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PracticeHubClient() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState<"peer" | "ai_examiner" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(mode: "peer" | "ai_examiner") {
    setError(null);
    if (!ageConfirmed) {
      setError("Confirm you are 18 or older to continue.");
      return;
    }
    const name = displayName.trim() || "Guest";
    setLoading(mode);
    try {
      const res = await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          displayName: name,
          ageConfirmed: true,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Could not start");
        return;
      }
      router.push(`/practice/session/${data.view.sessionId}`);
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <form onSubmit={onSubmit} className="animate-fade-in space-y-6">
      <Card className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Quick start
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          <li>One of you is Examiner; the other is Candidate.</li>
          <li>Follow the timed stages. Examiner sees private AI cues.</li>
          <li>After round 1, roles swap automatically for round 2.</li>
          <li>Join with audio when both are in the peer session.</li>
        </ol>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--color-fg)]">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-fg)] outline-none ring-[var(--color-accent)] focus:ring-2"
          />
        </label>
        <label className="flex items-start gap-2 text-sm text-[var(--color-fg)]">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span>I confirm I am 18 or older.</span>
        </label>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="space-y-2">
            <Users className="text-[var(--color-brand-violet)]" />
            <h3 className="text-lg font-semibold">Invite a peer</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Get a shareable link. Each person sees a different role screen.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => start("peer")}
            disabled={loading !== null}
          >
            <Sparkles size={16} />
            {loading === "peer" ? "Creating…" : "Start peer practice"}
          </Button>
        </Card>
        <Card className="flex flex-col gap-4">
          <div className="space-y-2">
            <Bot className="text-[var(--color-examiner)]" />
            <h3 className="text-lg font-semibold">Practice with AI</h3>
            <p className="text-sm text-[var(--color-muted)]">
              You are the candidate; AI provides examiner guidance and follow-up
              suggestions.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => start("ai_examiner")}
            disabled={loading !== null}
          >
            {loading === "ai_examiner" ? "Creating…" : "Start AI practice"}
          </Button>
        </Card>
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
