"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function JoinPracticeClient({ inviteToken }: { inviteToken: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setError(null);
    if (!ageConfirmed) {
      setError("Confirm you are 18 or older to continue.");
      return;
    }
    const name = displayName.trim() || "Guest";
    setLoading(true);
    try {
      const res = await fetch("/api/practice/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteToken,
          displayName: name,
          ageConfirmed: true,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Could not join");
        return;
      }
      router.push(`/practice/session/${data.view.sessionId}`);
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="animate-fade-in mx-auto max-w-lg space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Join peer practice
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        You are joining a Flownic telc B1 speaking session. You will receive the
        complementary role (examiner or candidate).
      </p>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Display name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none ring-[var(--color-accent)] focus:ring-2"
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          className="mt-1"
        />
        <span>I confirm I am 18 or older.</span>
      </label>
      <Button type="button" onClick={join} disabled={loading}>
        {loading ? "Joining…" : "Join session"}
      </Button>
      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
