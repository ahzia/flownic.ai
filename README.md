# Flownic

AI-guided peer practice for high-stakes spoken assessments.

**Active MVP:** telc Deutsch B1 speaking — fixed-slot peer sessions, server-authoritative role privacy, evidence-based practice feedback, AI examiner fallback.

## Docs

Start with [`AGENTS.md`](./AGENTS.md) and [`docs/README.md`](./docs/README.md).

Baseline audit: [`docs/00_Baseline_Audit_and_Implementation_Plan.md`](./docs/00_Baseline_Audit_and_Implementation_Plan.md).

## Setup

```bash
pnpm install
cp .env.example .env.local
# Fill:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# SUPABASE_SECRET_KEY   (fix typo SuPABASE_SECRET_KEY if present)
# NEXT_PUBLIC_LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET
# OPENAI_API_KEY
pnpm dev
```

Guest practice (no account): open `/` → **Start practicing** → invite peer or AI practice.

Logo: `public/flownic-logo.svg`

## Docs

- Plan: [`docs/plans/2026-07-28_theme_guest_demo_practice.md`](./docs/plans/2026-07-28_theme_guest_demo_practice.md)
- ADR guest tryout: [`docs/adr/0001-guest-tryout-without-email.md`](./docs/adr/0001-guest-tryout-without-email.md)
- Agent entry: [`AGENTS.md`](./AGENTS.md)
