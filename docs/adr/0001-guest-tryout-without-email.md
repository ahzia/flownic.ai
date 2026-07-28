# ADR 0001: Guest tryout without email for demo MVP

- Status: accepted
- Date: 2026-07-28
- Deciders: Founders (via product feedback)

## Context

The YC technical guide defaults booking/session join to authenticated users. For the current demo MVP, founders need a 3-minute walkthrough where two people can immediately practice telc B1 roles without signup friction.

## Decision

Add a first-class **Try without an account** path that:

1. Uses Supabase **anonymous auth** when configured (preferred), otherwise a local guest token.
2. Lands on `/practice` with quick-start instructions.
3. Allows **invite peer** or **practice with AI**.
4. Enforces the same role-privacy and blueprint rules as authenticated sessions.

Email magic-link auth and booking remain available for the later pilot funnel.

## Consequences

- Faster demos and user testing.
- Anonymous users must still pass age confirmation and consent copy.
- Session APIs must authorize by membership token / anon uid, not only email profiles.
- Metrics should flag `guest` / `anonymous` so organic pilot metrics stay clean later.

## Alternatives considered

- Require magic link for every demo — rejected (too much friction for a 3-minute video).
- Pure client-only mock with no server — rejected (breaks role privacy and LiveKit token safety).
