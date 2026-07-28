# Flownic baseline audit (T00)

**Date:** 2026-07-28  
**Status:** Complete — greenfield repository  
**Companion:** Technical guide §33–§34

## Current state

The repository contained product/engineering docs, Cursor rules (`AGENTS.md`, `.cursor/rules`), and agent skills. **No application code, schema, or CI existed.**

## P0 matrix

| Area | Status | Notes |
|---|---|---|
| Next.js app shell | missing | Scaffold as modular monolith per §7 |
| Env validation / feature flags | missing | Zod env + flags from §3.3 / §32 |
| CI skeleton | missing | `pnpm check`, unit, e2e placeholders |
| Auth (Supabase passwordless) | missing | SSR cookies |
| Intake / profiles | missing | |
| Fixed slots / booking | missing | Manual matching OK |
| Blueprint + publisher | missing | `telc-de-b1-speaking` placeholder until teacher review |
| Session state engine | missing | |
| LiveKit media | missing | Prefabs; adapter boundary first |
| Transcription | missing | |
| Examiner follow-ups | missing | |
| AI examiner fallback | missing | |
| Reports / jobs | missing | |
| Ops admin | missing | |
| Analytics / payments | missing | |
| RLS / migrations | missing | |

## Security / data-loss risks (pre-code)

- Secrets must never land in `NEXT_PUBLIC_*` or client bundles.
- Role privacy must be server-filtered from day one of session payloads.
- No cascade deletes on payment/safety/consent/audit tables.
- Preview envs must not share production providers.

## Differences from the technical requirements

None in code — requirements are the implementation target. Doc paths in §34 still say `docs/product/…`; actual files live under `docs/` with numbered prefixes (see `docs/README.md`).

## Ordered implementation plan

1. **T01** — App scaffold, env Zod, feature flags, scripts, CI, folder layout  
2. **T02** — Schema migrations + RLS + generated types stub  
3. **T03** — Blueprint Zod schema + placeholder content + publisher stub  
4. **T04** — Auth + intake + slots/booking UI skeleton  
5. **T05+** — Matching/ops, session engine, LiveKit, AI, reports (separate work packages)

## First work package files (T01)

- `package.json`, `pnpm-lock.yaml`, Next/TS/Tailwind/ESLint config  
- `src/app`, `src/domain`, `src/features`, `src/server`, `src/shared`, `src/components`  
- `src/shared/env`, feature flags  
- `.env.example`, `.github/workflows/ci.yml`  
- `vitest` + Playwright scaffolding  

## Status after first build (2026-07-28)

| Area | Status | Notes |
|---|---|---|
| Next.js app shell | working | App Router modular layout under `src/` |
| Env validation / feature flags | working | Zod env + flags; `.env.example` |
| CI skeleton | working | `.github/workflows/ci.yml` |
| Auth (Supabase passwordless) | partial | Login OTP UI + callback + middleware; needs project keys |
| Intake / profiles | partial | Domain validation + UI; persistence pending configured Supabase |
| Fixed slots / booking | partial | Book page shell; listing after seed slots |
| Blueprint + publisher | partial | Zod schema + draft JSON + validate script; DB publish pending |
| Schema / RLS | partial | `supabase/migrations/20260728000000_init.sql` ready to apply |
| Session state engine | partial | Transition helpers only |
| LiveKit media | missing | Adapter contract stub only |
| Transcription / AI / reports | missing | |

Next recommended packages: wire Supabase project + apply migration (finish T04 persistence), then T05 ops matching, then T06 session engine.