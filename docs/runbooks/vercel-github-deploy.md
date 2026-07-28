# Flownic Vercel / GitHub deploy checklist

## Go / no-go

**Yes — safe to push** once `pnpm check`, `pnpm test`, and `pnpm build` pass locally. `.env.local` is gitignored.

Guest practice persists in Supabase (`guest_practice_sessions`). Peer invites need those env vars + migrations applied.

## Before `git push`

1. Confirm `.env.local` is **not** staged.
2. Do not commit secrets, keys, or recordings.
3. Remote: `git@github.com:ahzia/flownic.ai.git`

## Vercel project settings

- Framework: Next.js (auto-detected)
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build`
- Output: default Next.js
- Node: **22.x** (pinned in `package.json` engines)

Build does **not** require provider secrets; missing keys only disable LiveKit/OpenAI/Supabase features at runtime.

## Environment variables (Preview + Production)

| Variable | Required for |
|---|---|
| `NEXT_PUBLIC_ENVIRONMENT` | `preview` or `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Guest practice persistence |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Guest practice / auth |
| `SUPABASE_SECRET_KEY` | Server guest session R/W |
| `NEXT_PUBLIC_LIVEKIT_URL` | Peer audio/video |
| `LIVEKIT_API_KEY` | LiveKit tokens |
| `LIVEKIT_API_SECRET` | LiveKit tokens |
| `OPENAI_API_KEY` | Auto follow-ups + practice reports |
| `FEATURE_PEER_SESSIONS_ENABLED=true` | Peer invites |
| `FEATURE_AI_FALLBACK_ENABLED=true` | AI examiner mode |
| `FEATURE_EXAMINER_FOLLOWUPS_ENABLED=true` | Auto follow-up generation |
| `FEATURE_LIVE_TRANSCRIPTION_ENABLED=true` | Web Speech / mock transcript loop |
| `FEATURE_VIDEO_ENABLED=true` | Camera grid |

Leave blank if unused: `RESEND_*`, `SENTRY_DSN`, `PAYMENT_LINK_URL`.

Also run guest practice migrations on the linked Supabase project (see `docs/runbooks/supabase-guest-practice.md`).

## If install fails on Vercel

Copy the log from the first `Error:` / `ELIFECYCLE` line onward. Local `pnpm build` passing usually means env/Node/install mismatch, not TypeScript.
