# Plan: Theme, guest demo practice, and demo-ready peer session

**Date:** 2026-07-28  
**Goal:** Ship a polished, theme-driven MVP path that supports a **3-minute cofounder demo** (examiner + candidate on different screens) **without requiring email signup**, then continue wiring Supabase / LiveKit / session engine.

**Related feedback:** branding + dark/light theme; no static colors; guest tryout; peer invite or AI practice; modern UX; env key rename; then next engineering tasks.

---

## 0. Constraints (from product docs)

- One track only: `telc-de-b1-speaking`.
- Server-authoritative **role privacy** (examiner cues never in candidate payloads).
- Practice-only language — no official scores / telc affiliation.
- LiveKit transports media; Flownic owns stages, roles, timers.
- Guest tryout is an **MVP demo acceleration** (ADR-worthy scope tweak vs “auth required for booking”). Booking/auth flows remain available for the real pilot funnel.

---

## 1. Branding & theme system

### Deliverables

| Item | Location |
|---|---|
| Theme tokens (light + dark) | `src/styles/theme.css` |
| Tailwind / CSS variable wiring | `src/app/globals.css` |
| Theme provider + toggle | `src/features/theme/` |
| Brand assets | `public/brand/flownic-logo.svg` (+ optional PNG drop-in) |
| Shared UI primitives using tokens only | `src/components/ui/` |

### Design direction

- Distinct Flownic brand (conversation / spoken practice), not generic purple-AI.
- Light default; dark mode via `class="dark"` on `<html>`, persisted in `localStorage`, respects `prefers-color-scheme` on first visit.
- Semantic tokens only in components: `--color-bg`, `--color-surface`, `--color-fg`, `--color-muted`, `--color-border`, `--color-accent`, `--color-accent-fg`, `--color-danger`, `--color-success`, `--color-warning`, `--color-examiner`, `--color-candidate`, radii, shadows, motion durations.
- **No raw Tailwind palette colors** (`text-red-700`, `bg-green-500`, etc.) in product UI — map everything through tokens.
- Logo: use `public/brand/flownic-logo.svg`. *(Logo file was not found in the repo at plan time — create a brand SVG mark/wordmark as starter; replace by dropping the official asset at the same path.)*

### Acceptance

- Toggle switches light ↔ dark without flash (inline script or `suppressHydrationWarning` + stored preference).
- Home, login, intake, book, practice, and session shells all use tokens.
- `pnpm check` clean.

---

## 2. Environment variable alignment

### New canonical names (match `.env.local`)

| Purpose | Env var |
|---|---|
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Client key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Server secret key | `SUPABASE_SECRET_KEY` |
| LiveKit URL (public) | `NEXT_PUBLIC_LIVEKIT_URL` |
| LiveKit API | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` |
| OpenAI | `OPENAI_API_KEY` |

### Code updates

- Update `.env.example`, `src/shared/env`, browser/server Supabase clients, health route.
- Rename `src/server/db/service-role.ts` → `secret-client.ts` (secret key, not legacy service_role).
- **Note:** `.env.local` currently has typo `SuPABASE_SECRET_KEY` — normalize to `SUPABASE_SECRET_KEY` (document in README; do not commit `.env.local`).

### Acceptance

- App boots with publishable + secret keys.
- No references to `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` except optional legacy aliases if needed for migration.

---

## 3. Guest tryout (no account) — primary demo path

### User journey

1. **Home** — primary CTA: **Try without an account** (secondary: Sign in).
2. Redirect to **`/practice`** — quick-start hub for German B1 speaking:
   - Short “how this works” steps (≤5 bullets).
   - Disclaimer (practice only).
   - Age confirmation checkbox (18+) before starting.
3. Two actions:
   - **Invite a peer** → create guest session → show copyable invite link → host waits / joins room as Role A.
   - **Practice with AI** → create AI-examiner session → host is candidate; AI acts as examiner (guided stages).
4. Peer opens invite link → `/practice/join/[token]` → claims the other role → both enter live session UI.
5. During session: synchronized stages/timers; **examiner sees private AI cues**; **candidate does not**.

### Identity approach

Prefer **Supabase anonymous auth** for “try without account” so RLS/`auth.uid()` still work when DB is connected:

1. `signInAnonymously()` on Try CTA (if Supabase configured).
2. Fallback: local guest id in cookie + in-memory/server session store if anon auth is disabled — still demoable.

Document: enable Anonymous Sign-Ins in Supabase Auth settings.

### Routes

| Route | Purpose |
|---|---|
| `/` | Brand home + Try / Sign in |
| `/practice` | Quick-start hub |
| `/practice/session/[id]` | Live practice shell (role-filtered) |
| `/practice/join/[token]` | Peer claim + redirect into session |
| `/api/practice/session` | Create guest/AI session |
| `/api/practice/join` | Join via invite token |
| `/api/practice/session/[id]/state` | Authoritative state + role view |
| `/api/practice/session/[id]/transition` | Advance stage / switch roles |
| `/api/practice/session/[id]/livekit` | Short-lived LiveKit token |
| `/api/practice/session/[id]/follow-up` | Examiner-only AI suggestion |

---

## 4. Demo-ready peer session (3-minute video)

### Must work for cofounders on two devices/browsers

| Capability | MVP bar for demo |
|---|---|
| Invite link | One-click join, correct role assignment |
| Role privacy | Different instructions per role; network payloads filtered |
| Stages + timer | Intro → tasks from blueprint; visible countdown |
| Role switch | Reciprocal round after round 1 |
| Media | LiveKit audio (video optional via flag); PreJoin device check |
| AI guide | Examiner follow-up button returns 1–2 short cues; AI mode runs examiner script |
| Resilience | If AI fails, peer call continues; show “suggestion unavailable” |

### Session state engine (domain)

- Pure transitions in `src/domain/session/` (status, round, stage, role swap).
- Server holds truth; clients poll or refresh on action (Realtime optional later).
- Candidate payload builder never includes examiner instruction keys / follow-up policy internals.

### LiveKit

- Implement real adapter using official server SDK: room per session, short-lived tokens, membership checks.
- Client: LiveKit React prefabs or minimal room UI inside practice shell.

### AI

- Server-only OpenAI call for follow-ups (structured Zod output).
- AI examiner mode: stage instructions spoken/shown as examiner; for demo, text+timer first if Realtime voice is too heavy — prefer voice if time allows after text path works.

---

## 5. UX / motion / assets

### Priority: clarity over decoration

- Clear role badges (“You are Examiner” / “You are Candidate”).
- Large timer, stage name, next action.
- Invite link with copy feedback.
- Empty / loading / error / reconnect states.
- Subtle motion: page enter, button press, stage change (CSS / small `motion` usage — do not overdo).
- Icons: Lucide (tree-shakeable) for actions; brand SVG for logo.
- Remove default Next.js scaffold SVGs from product chrome.

---

## 6. Implementation sequence

| Phase | Work | Depends |
|---|---|---|
| **P0** | Write this plan; ADR note for guest tryout | — |
| **P1** | Theme tokens, provider, toggle, brand assets; restyle existing pages | P0 |
| **P2** | Env rename (publishable/secret); fix clients | P0 |
| **P3** | Guest practice hub + session create/join APIs + role views + state engine | P1, P2 |
| **P4** | LiveKit tokens + room UI in session | P3 |
| **P5** | Examiner follow-up + AI practice mode (OpenAI) | P3 |
| **P6** | Supabase persistence for sessions/participants when configured; booking wiring | P2, P3 |
| **P7** | Polish for 3-min demo script + smoke checklist | P4, P5 |

---

## 7. Demo script (target ~3 minutes)

1. Home → **Try without an account** (10s).
2. Quick-start instructions + age confirm → **Invite a peer** (20s).
3. Copy link; cofounder joins on second device (20s).
4. Show examiner private cues vs candidate task card (30s).
5. Speak briefly with LiveKit audio; advance stage (40s).
6. Role switch for round 2 (20s).
7. Optional: second take starts **Practice with AI** (30s).
8. Close on disclaimer / “practice feedback coming next” (10s).

---

## 8. Out of scope for this pass

- Full booking/matching ops UI polish.
- Official report generation / payment.
- Multiple exam tracks.
- Recording by default.
- Native apps.

---

## 9. Success criteria

- [x] Light/dark theme via tokens; no static color literals in product UI.
- [x] Guest can start practice without email.
- [x] Invite link gives peer the other role with different screen content.
- [x] Examiner-only AI guidance never appears in candidate UI/network.
- [x] LiveKit audio works for two participants when keys are set.
- [x] Env example + code use publishable/secret Supabase keys.
- [ ] Cofounders can record a coherent 3-minute walkthrough. *(manual)*

### Implementation note (2026-07-28)

Guest practice sessions currently use a **process memory store** (fine for local `pnpm dev` demos). Persist to Supabase next so multi-instance / production demos stay durable. Brand SVG lives at `public/brand/` — replace with the official logo file at the same path when available.

---

## 10. Next after this plan

Implement **P1 → P5** immediately in this workstream, then **P6** persistence. Prefer vertical demo slice over perfect booking funnel.
