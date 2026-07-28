# Flownic Vercel / GitHub deploy checklist

## Go / no-go

**Yes — safe to push and create a Vercel project** for a first preview deployment.

`pnpm check`, `pnpm test`, and `pnpm build` all pass locally. `.env.local` is gitignored.

## Critical production limitation

Guest practice sessions currently use an **in-memory store** (`src/server/services/practice-session.ts`).

On Vercel serverless this means:

- Peer invite links may fail if host and peer hit different instances
- Sessions can vanish on cold starts / redeploys

**Implication:** marketing pages, login shell, and solo AI practice may work; **reliable two-browser peer demos need Supabase persistence next.**

## Before `git push`

1. Confirm `.env.local` is **not** staged (`git status` should not list it).
2. Do not commit secrets, keys, or recordings.
3. Remote: `git@github.com:ahzia/flownic.ai.git`

## Vercel project settings

- Framework: Next.js (auto-detected)
- Install: `pnpm install`
- Build: `pnpm build`
- Output: default Next.js
- Node: 22.x

## Environment variables to set in Vercel

Copy from local `.env.local` into the Vercel project (Preview + Production as needed):

| Variable | Required for |
|---|---|
| `NEXT_PUBLIC_ENVIRONMENT` | `preview` or `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth / future persistence |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Auth / future persistence |
| `SUPABASE_SECRET_KEY` | Server privileged ops |
| `NEXT_PUBLIC_LIVEKIT_URL` | Peer audio |
| `LIVEKIT_API_KEY` | Peer audio tokens |
| `LIVEKIT_API_SECRET` | Peer audio tokens |
| `OPENAI_API_KEY` | Examiner follow-ups / AI practice |
| Feature flags | Optional; defaults to off if blank |

Leave blank if unused: `RESEND_*`, `SENTRY_DSN`, `PAYMENT_LINK_URL`.

## Suggested first git commands

```bash
cd /Users/ahzia/kick-start/yc-flownic
# repo may already be initialized
git remote add origin git@github.com:ahzia/flownic.ai.git
git add -A
git status   # verify .env.local is absent
git commit -m "Initial Flownic MVP scaffold with guest practice flow"
git branch -M main
git push -u origin main
```

Then import the repo in Vercel and paste env vars before the first production deploy.
