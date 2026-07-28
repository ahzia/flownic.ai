"use client";

import { useState, type FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/shared/supabase/browser-client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      setStatus("sent");
      setMessage("Check your email for a magic link.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not start sign-in. Check configuration.",
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--color-fg)]">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none ring-[var(--color-accent)] focus:ring-2"
          placeholder="you@example.com"
        />
      </label>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Continue with email"}
      </Button>
      {message ? (
        <p
          role="status"
          className={
            status === "error"
              ? "text-sm text-[var(--color-danger)]"
              : "text-sm text-[var(--color-muted)]"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
