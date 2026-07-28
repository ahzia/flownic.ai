# Flownic repository instructions

Flownic is an AI-guided peer practice network for high-stakes spoken assessments.
The active build target is a **narrow YC MVP**: one telc Deutsch B1 speaking track,
fixed-slot peer sessions, server-authoritative role privacy, evidence-based practice
feedback, and an AI examiner fallback.

There is no application code yet. Build from the docs below; do not invent a broader
platform.

## Source order

When sources conflict, follow this order:

1. **MVP business scope** — [`docs/02_Flownic_YC_MVP_Business_Plan.md`](docs/02_Flownic_YC_MVP_Business_Plan.md)
2. **Technical behavior and architecture** — [`docs/03_Flownic_YC_MVP_Technical_Requirements_and_Cursor_Implementation_Guide.md`](docs/03_Flownic_YC_MVP_Technical_Requirements_and_Cursor_Implementation_Guide.md)
3. **Live media decision** — [`docs/04_Flownic_MVP_Online_Video_Simulation_Technology_Guide.md`](docs/04_Flownic_MVP_Online_Video_Simulation_Technology_Guide.md)
4. **Long-term direction only** — [`docs/01_Flownic_Product_Overview_Business_Vision_and_MVP_Guardrails.docx.md`](docs/01_Flownic_Product_Overview_Business_Vision_and_MVP_Guardrails.docx.md)
5. **Accepted ADRs and tested code** — `docs/adr/` and the repository after a verified audit

Material scope, provider, schema, authorization, or retention changes require founder
approval and an ADR in `docs/adr/`.

## Product lock (MVP)

- One exact exam track: `telc-de-b1-speaking` (teacher-reviewed blueprint before lock).
- Adults 18+; Germany / NRW + online German-learning communities first.
- Peer practice is the default; AI guides the acting examiner and provides fallback.
- Practice feedback with evidence and uncertainty — never official scores or telc affiliation.
- Manual founder matching and ops are valid until demand proves automation is needed.

### Explicitly out of scope

Second exams/languages/interviews, native apps, marketplace/payouts, school SSO,
social feed/gamification, pronunciation diagnostics as a product, official pass
predictions, custom WebRTC/self-hosted media, microservices, and feature sprawl
“for the future platform.”

## Stack decisions

| Layer | Choice |
|---|---|
| App | Next.js App Router + React + strict TypeScript (single modular monolith) |
| Package manager | `pnpm` |
| Styling | Tailwind CSS; shadcn/ui when UI primitives are needed |
| Validation | Zod at env, request, blueprint, and AI-output boundaries |
| Auth / DB | Supabase Auth (passwordless email + guest tryout) + PostgreSQL + RLS |
| Auth keys | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_SECRET_KEY` (not legacy anon/service_role) |
| Peer media | LiveKit Cloud + React prefabs; Flownic owns all product state |
| AI voice | OpenAI Realtime for AI examiner |
| AI text | OpenAI server SDK for follow-ups and reports |
| Email | Resend (or adapter-equivalent) |
| Jobs | PostgreSQL job table + protected worker/retry |
| Hosting / monitoring | Vercel + Sentry-compatible errors |
| Tests | Vitest, Testing Library, Playwright, SQL/RLS tests |

## Target repository shape

When scaffolding the app, prefer the layout in the technical guide §7:

`src/app`, `src/components`, `src/domain`, `src/features`, `src/server`, `src/shared`,
`content/blueprints/telc-de-b1-speaking/`, `supabase/`, `tests/`.

Boundary rules:

- `src/domain` — pure state/policy/schema; no React or provider SDKs
- `src/server` — secrets, DB, adapters, privileged commands
- `src/features` — user-facing flow composition
- `src/app` — routes, layouts, thin adapters only

## Commands

Once the app exists:

- Install: `pnpm install --frozen-lockfile`
- Check: `pnpm check`
- Unit tests: `pnpm test`
- E2E: `pnpm test:e2e`
- Database tests: `pnpm test:db`

## Invariants

- Use strict TypeScript; validate external input with Zod.
- Keep business rules in domain/services, not route components.
- Use migrations for database changes and regenerate types; never hand-edit generated types.
- Enforce role privacy on the server — UI hiding is not authorization.
- Never expose service keys, provider secrets, private blueprint content, or raw prompts.
- PostgreSQL is the system of record; LiveKit/OpenAI are transport/processing only.
- A peer session must continue when AI or transcription fails.
- Reports are asynchronous; do not block session completion on generation.
- Add or update tests for every behavior change.
- Do not broaden beyond the active telc B1 MVP without founder approval.
- Do not add overlapping libraries for forms, validation, dates, state, HTTP, or UI.

## Skills to use

Read and follow the matching project skill under `.agents/skills/` when the task touches that domain:

| Domain | Skill |
|---|---|
| React / Next.js performance | `vercel-react-best-practices` |
| React composition | `vercel-composition-patterns` |
| UI review / a11y | `web-design-guidelines` |
| shadcn/ui primitives | `shadcn` |
| Supabase Auth, clients, RLS, migrations | `supabase` |
| Postgres performance / schema | `supabase-postgres-best-practices` |
| LiveKit / realtime media agents | `livekit-agents` |
| Transactional email | `resend` |
| Playwright E2E / browser automation | `playwright-cli` |
| Security review patterns | `security-best-practices` |
| Sentry / Next.js monitoring | `sentry-nextjs-sdk` |

## Cursor workflow

1. Prefer Plan Mode for the first baseline audit and for multi-file or migration work.
2. One work package per conversation; state acceptance criteria and non-goals.
3. Inspect existing code before replacing it to match doc naming.
4. Stop and ask when product, security, provider, or schema conflicts appear.
5. Save accepted plans in the repo; do not rely on chat memory.
6. Commit only after human review.

Anti-patterns to reject are listed in the technical guide §35.4 and in
`.cursor/rules/50-testing-definition-of-done.mdc`.
