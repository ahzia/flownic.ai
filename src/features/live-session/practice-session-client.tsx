"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  useParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  Bot,
  Copy,
  Link2,
  Mic,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RolePrivateView } from "@/domain/session/state";

function useCountdown(endsAt: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endsAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (!endsAt) return null;
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000));
}

function formatTime(total: number | null) {
  if (total === null) return "--:--";
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ParticipantCount() {
  const participants = useParticipants();
  return (
    <span className="text-sm text-[var(--color-muted)]">
      {participants.length} in room
    </span>
  );
}

export function PracticeSessionClient({
  sessionId,
  initialView,
}: {
  sessionId: string;
  initialView: RolePrivateView;
}) {
  const [view, setView] = useState(initialView);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [followUps, setFollowUps] = useState<
    Array<{ intent: string; text: string }>
  >([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [livekit, setLivekit] = useState<{
    token: string;
    url: string;
  } | null>(null);

  const remaining = useCountdown(view.stageEndsAt);
  const inviteUrl = useMemo(() => {
    if (!view.inviteToken || typeof window === "undefined") return null;
    return `${window.location.origin}/practice/join/${view.inviteToken}`;
  }, [view.inviteToken]);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const res = await fetch(`/api/practice/session/${sessionId}`);
      const data = await res.json();
      if (data.ok) setView(data.view);
    }, 2000);
    return () => window.clearInterval(id);
  }, [sessionId]);

  useEffect(() => {
    if (!view.mediaReady || view.mode === "ai_examiner") return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/practice/session/${sessionId}/livekit`, {
        method: "POST",
      });
      const data = await res.json();
      if (!cancelled && data.ok) {
        setLivekit({ token: data.grant.token, url: data.grant.url });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, view.mediaReady, view.mode]);

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function nextStage() {
    setError(null);
    const res = await fetch(`/api/practice/session/${sessionId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "next_stage" }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error);
      return;
    }
    setView(data.view);
    setFollowUps([]);
  }

  async function requestFollowUp() {
    setFollowUpLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/practice/session/${sessionId}/follow-up`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setFollowUps(data.suggestions ?? []);
    } finally {
      setFollowUpLoading(false);
    }
  }

  const roleSoft =
    view.yourRole === "examiner"
      ? "bg-[var(--color-examiner-soft)] text-[var(--color-examiner)]"
      : "bg-[var(--color-candidate-soft)] text-[var(--color-candidate)]";

  return (
    <div className="animate-fade-in grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-[var(--radius-full)] px-3 py-1 text-sm font-semibold ${roleSoft}`}
          >
            {view.yourRole === "examiner" ? <Users size={14} /> : <Mic size={14} />}
            You are {view.yourRole === "examiner" ? "Examiner" : "Candidate"}
          </span>
          <span className="rounded-[var(--radius-full)] border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-muted)]">
            {view.roundKey ?? "—"} · {view.stageKey ?? "—"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--color-surface)] px-3 py-1 text-sm font-semibold text-[var(--color-fg)] shadow-[var(--shadow-sm)]">
            <Timer size={14} />
            {formatTime(remaining)}
          </span>
        </div>

        <Card className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Your instructions
          </h2>
          <p className="whitespace-pre-wrap text-[var(--color-fg)] leading-relaxed">
            {view.stageInstruction ?? "Waiting for stage…"}
          </p>
          {view.yourRole === "examiner" ? (
            <p className="text-sm text-[var(--color-muted)]">
              Private examiner guidance — your partner cannot see this panel.
            </p>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              Answer naturally. You will not see examiner cues.
            </p>
          )}
        </Card>

        {view.yourRole === "examiner" ? (
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 font-semibold">
                <Sparkles size={16} /> AI follow-up cues
              </h3>
              <Button
                type="button"
                variant="secondary"
                onClick={requestFollowUp}
                disabled={followUpLoading}
              >
                {followUpLoading ? "Thinking…" : "Suggest follow-up"}
              </Button>
            </div>
            {followUps.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                Request a short prompt when you need help guiding the candidate.
              </p>
            ) : (
              <ul className="space-y-2">
                {followUps.map((item) => (
                  <li
                    key={`${item.intent}-${item.text}`}
                    className="rounded-[var(--radius-md)] bg-[var(--color-examiner-soft)] px-3 py-2 text-sm text-[var(--color-fg)]"
                  >
                    <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-examiner)]">
                      {item.intent}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={nextStage}>
            Next stage
          </Button>
          {view.peerDisplayName ? (
            <span className="self-center text-sm text-[var(--color-muted)]">
              Partner: {view.peerDisplayName}
            </span>
          ) : view.mode === "peer" ? (
            <span className="self-center text-sm text-[var(--color-warning)]">
              Waiting for peer to join…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 self-center text-sm text-[var(--color-muted)]">
              <Bot size={14} /> AI examiner mode
            </span>
          )}
        </div>
        {error ? (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {inviteUrl ? (
          <Card className="space-y-3">
            <h3 className="inline-flex items-center gap-2 font-semibold">
              <Link2 size={16} /> Invite your peer
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Send this link to your practice partner. They will join as the
              other role.
            </p>
            <code className="block overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
              {inviteUrl}
            </code>
            <Button type="button" variant="secondary" onClick={copyInvite}>
              <Copy size={14} />
              {copied ? "Copied" : "Copy link"}
            </Button>
          </Card>
        ) : null}

        <Card className="space-y-3">
          <h3 className="font-semibold">Live audio</h3>
          {view.mode === "ai_examiner" ? (
            <p className="text-sm text-[var(--color-muted)]">
              AI examiner mode uses on-screen guidance and follow-up suggestions.
              Peer sessions include live audio when both partners are connected.
            </p>
          ) : livekit ? (
            <LiveKitRoom
              token={livekit.token}
              serverUrl={livekit.url}
              connect
              audio
              video={false}
              className="space-y-3"
              data-lk-theme="default"
            >
              <ParticipantCount />
              <RoomAudioRenderer />
              <ControlBar
                controls={{
                  camera: false,
                  screenShare: false,
                  leave: false,
                }}
              />
            </LiveKitRoom>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              {view.mediaReady
                ? "Connecting to audio…"
                : "Live audio will be available once media is configured."}
            </p>
          )}
        </Card>

        <Card>
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            Not affiliated with telc. Feedback is practice guidance, not an
            official score.
          </p>
        </Card>
      </div>
    </div>
  );
}
