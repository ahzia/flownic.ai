"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
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

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

const MOCK_LINES_BY_STAGE: Record<string, string[]> = {
  intro: [
    "Ich heiße Amina und komme aus Syrien. Ich wohne seit zwei Jahren in Köln.",
    "Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.",
    "In meiner Freizeit lese ich gerne und treffe Freunde.",
  ],
  "topic-talk": [
    "Viele Menschen arbeiten heute von zu Hause. Das spart Zeit, aber der Kontakt fehlt manchmal.",
    "Ich finde Homeoffice gut, weil ich flexibler bin. Aber Meetings im Büro sind auch wichtig.",
    "Zum Beispiel arbeite ich morgens zu Hause und nachmittags im Büro.",
  ],
  planning: [
    "Ich schlage vor, dass wir am Samstagmorgen mit dem Zug nach Hamburg fahren.",
    "Vielleicht können wir in einem Hostel übernachten und ein Museum besuchen.",
    "Wenn es regnet, gehen wir ins Café oder ins Kino.",
  ],
};

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

function MediaStage({ videoEnabled }: { videoEnabled: boolean }) {
  const tracks = useTracks(
    videoEnabled
      ? [
          { source: Track.Source.Camera, withPlaceholder: true },
          { source: Track.Source.ScreenShare, withPlaceholder: false },
        ]
      : [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  if (!videoEnabled) {
    return (
      <>
        <ParticipantCount />
        <RoomAudioRenderer />
        <ControlBar
          controls={{
            camera: false,
            screenShare: false,
            leave: false,
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <ParticipantCount />
      </div>
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <GridLayout
          tracks={tracks}
          style={{ minHeight: "280px", maxHeight: "420px" }}
        >
          <ParticipantTile />
        </GridLayout>
      </div>
      <RoomAudioRenderer />
      <ControlBar
        controls={{
          camera: true,
          microphone: true,
          screenShare: false,
          leave: false,
        }}
      />
    </div>
  );
}

function bandLabel(band: string) {
  if (band === "solid") return "Solid";
  if (band === "developing") return "Developing";
  return "Needs work";
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
  const [completing, setCompleting] = useState(false);
  const [transcriptMode, setTranscriptMode] = useState<
    "idle" | "speech" | "mock" | "unsupported"
  >("idle");
  const [listening, setListening] = useState(false);
  const [livekit, setLivekit] = useState<{
    token: string;
    url: string;
  } | null>(null);
  const mockIndex = useRef(0);
  const posting = useRef(false);

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

  async function postTranscript(text: string, source: "speech" | "mock") {
    if (posting.current || view.status === "completed") return;
    posting.current = true;
    try {
      const res = await fetch(`/api/practice/session/${sessionId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source }),
      });
      const data = await res.json();
      if (data.ok) setView(data.view);
      else setError(data.error);
    } finally {
      posting.current = false;
    }
  }

  // Candidate: Web Speech API or mock transcript automation
  useEffect(() => {
    if (
      !view.liveTranscriptionEnabled ||
      view.yourRole !== "candidate" ||
      view.status === "completed" ||
      view.status === "processing"
    ) {
      return;
    }

    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? (
            window as unknown as {
              SpeechRecognition?: new () => SpeechRecognitionLike;
              webkitSpeechRecognition?: new () => SpeechRecognitionLike;
            }
          ).SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition?: new () => SpeechRecognitionLike;
            }
          ).webkitSpeechRecognition
        : undefined;

    if (SpeechRecognitionCtor) {
      startTransition(() => setTranscriptMode("speech"));
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "de-DE";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result?.isFinal && result[0]?.transcript) {
            void postTranscript(result[0].transcript.trim(), "speech");
          }
        }
      };
      recognition.onerror = () => {
        startTransition(() => setTranscriptMode("mock"));
      };
      recognition.onend = () => {
        startTransition(() => setListening(false));
        if (view.status === "in_progress" || view.status === "waiting") {
          try {
            recognition.start();
            startTransition(() => setListening(true));
          } catch {
            /* already started */
          }
        }
      };
      try {
        recognition.start();
        startTransition(() => setListening(true));
      } catch {
        startTransition(() => setTranscriptMode("mock"));
      }
      return () => {
        recognition.onend = null;
        recognition.stop();
        startTransition(() => setListening(false));
      };
    }

    startTransition(() => setTranscriptMode("mock"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart on stage/role
  }, [
    view.liveTranscriptionEnabled,
    view.yourRole,
    view.status,
    view.stageKey,
    sessionId,
  ]);

  // Mock transcript ticks when speech unsupported or errored
  useEffect(() => {
    if (
      transcriptMode !== "mock" ||
      view.yourRole !== "candidate" ||
      !view.liveTranscriptionEnabled ||
      view.status === "completed" ||
      view.status === "processing"
    ) {
      return;
    }
    const lines =
      MOCK_LINES_BY_STAGE[view.stageKey ?? "intro"] ??
      MOCK_LINES_BY_STAGE.intro!;
    mockIndex.current = 0;
    const id = window.setInterval(() => {
      const line = lines[mockIndex.current % lines.length]!;
      mockIndex.current += 1;
      void postTranscript(line, "mock");
    }, 12000);
    // fire one immediately for demo responsiveness
    void postTranscript(lines[0]!, "mock");
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    transcriptMode,
    view.yourRole,
    view.liveTranscriptionEnabled,
    view.status,
    view.stageKey,
    sessionId,
  ]);

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
  }

  async function completePractice() {
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/practice/session/${sessionId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setView(data.view);
    } finally {
      setCompleting(false);
    }
  }

  const roleSoft =
    view.yourRole === "examiner"
      ? "bg-[var(--color-examiner-soft)] text-[var(--color-examiner)]"
      : "bg-[var(--color-candidate-soft)] text-[var(--color-candidate)]";

  const followUps = view.followUpSuggestions ?? [];
  const report = view.practiceReport;

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

        {view.status !== "completed" ? (
          <Card className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              {view.stageTitle ?? "Your instructions"}
            </h2>
            <p className="whitespace-pre-wrap text-[var(--color-fg)] leading-relaxed">
              {view.stageInstruction ?? "Waiting for stage…"}
            </p>
            {view.yourRole === "examiner" && view.starterQuestions.length > 0 ? (
              <div className="space-y-2 rounded-[var(--radius-md)] bg-[var(--color-examiner-soft)] px-3 py-3">
                <p className="text-sm font-semibold text-[var(--color-examiner)]">
                  Starter questions — ask one at a time
                </p>
                <ol className="list-decimal space-y-1.5 pl-5 text-sm text-[var(--color-fg)]">
                  {view.starterQuestions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
              </div>
            ) : null}
            {view.yourRole === "examiner" ? (
              <p className="text-sm text-[var(--color-muted)]">
                Private examiner guidance — your partner cannot see this panel.
              </p>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                Speak naturally. Transcript and follow-ups update automatically.
              </p>
            )}
          </Card>
        ) : null}

        {view.yourRole === "candidate" &&
        view.liveTranscriptionEnabled &&
        view.status !== "completed" ? (
          <Card className="space-y-2">
            <h3 className="inline-flex items-center gap-2 font-semibold">
              <Mic size={16} /> Live transcript
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              {transcriptMode === "speech" && listening
                ? "Listening (German)…"
                : transcriptMode === "mock"
                  ? "Demo transcript mode — simulated lines while speech API is unavailable."
                  : "Starting transcription…"}
            </p>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
              {view.recentTranscript.length === 0 ? (
                <li className="text-[var(--color-muted)]">No speech yet.</li>
              ) : (
                view.recentTranscript.map((s) => (
                  <li key={s.id}>
                    <span className="text-xs text-[var(--color-muted)]">
                      {s.source === "mock" ? "demo" : "you"} ·{" "}
                    </span>
                    {s.text}
                  </li>
                ))
              )}
            </ul>
          </Card>
        ) : null}

        {((view.yourRole === "examiner" || view.mode === "ai_examiner") &&
          view.status !== "completed") ? (
          <Card className="space-y-3">
            <h3 className="inline-flex items-center gap-2 font-semibold">
              <Sparkles size={16} />{" "}
              {view.mode === "ai_examiner" && view.yourRole === "candidate"
                ? "AI examiner question"
                : "Auto follow-up"}
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              {view.mode === "ai_examiner" && view.yourRole === "candidate"
                ? "Updates automatically from what you just said."
                : "Updates when the candidate speaks — no paste needed."}
            </p>
            {view.yourRole === "examiner" && view.recentTranscript.length > 0 ? (
              <div className="space-y-1 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Candidate said
                </p>
                {view.recentTranscript.slice(-3).map((s) => (
                  <p key={s.id}>{s.text}</p>
                ))}
              </div>
            ) : null}
            {view.yourRole === "examiner" &&
            view.recentTranscript.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                Waiting for candidate speech…
              </p>
            ) : null}
            {followUps.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                {view.yourRole === "examiner"
                  ? "Use starter questions until the first transcript arrives."
                  : "Speak to receive the next AI question."}
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

        {report ? (
          <Card className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              Practice feedback
            </h2>
            <p className="text-[var(--color-fg)] leading-relaxed">
              {report.overallSummary}
            </p>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Practice marks</h3>
              <ul className="space-y-2">
                {report.rubricObservations.map((obs) => (
                  <li
                    key={`${obs.dimension}-${obs.observation}`}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{obs.dimension}</span>
                      <span className="rounded-[var(--radius-full)] bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs">
                        {bandLabel(obs.band)}
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        confidence: {obs.confidence}
                      </span>
                    </div>
                    <p>{obs.observation}</p>
                  </li>
                ))}
              </ul>
            </div>
            {report.strengths.length > 0 ? (
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Strengths</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {report.strengths.map((s) => (
                    <li key={s.claim}>{s.claim}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {report.corrections.length > 0 ? (
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Corrections</h3>
                <ul className="space-y-2 text-sm">
                  {report.corrections.map((c) => (
                    <li key={`${c.observedText}-${c.suggestedText}`}>
                      <span className="line-through text-[var(--color-muted)]">
                        {c.observedText}
                      </span>{" "}
                      → {c.suggestedText}
                      <p className="text-[var(--color-muted)]">{c.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="rounded-[var(--radius-md)] bg-[var(--color-candidate-soft)] px-3 py-2 text-sm">
              <p className="font-semibold">{report.nextPracticeFocus.title}</p>
              <p>{report.nextPracticeFocus.action}</p>
            </div>
            {report.limitations.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
                {report.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : null}
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {view.status !== "completed" && view.status !== "processing" ? (
            <>
              <Button type="button" onClick={nextStage}>
                Next stage
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={completePractice}
                disabled={completing}
              >
                {completing ? "Preparing feedback…" : "Complete practice"}
              </Button>
            </>
          ) : null}
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
          <h3 className="font-semibold">
            {view.videoEnabled ? "Live video & audio" : "Live audio"}
          </h3>
          {view.mode === "ai_examiner" ? (
            <p className="text-sm text-[var(--color-muted)]">
              Speak as the candidate. Live transcript drives examiner follow-ups
              automatically. Peer sessions also include LiveKit media when
              configured.
            </p>
          ) : livekit ? (
            <LiveKitRoom
              token={livekit.token}
              serverUrl={livekit.url}
              connect
              audio
              video={view.videoEnabled}
              className="space-y-3"
              data-lk-theme="default"
            >
              <MediaStage videoEnabled={view.videoEnabled} />
            </LiveKitRoom>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              {view.mediaReady
                ? "Connecting to media…"
                : "Live media will be available once LiveKit is configured."}
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
