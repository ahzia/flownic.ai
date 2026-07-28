# Supabase setup for reliable two-browser guest practice

Guest peer sessions are stored in Postgres (`guest_practice_sessions`) so host and peer can use different browsers / devices / Vercel instances.

## Env you already have (enough)

These are sufficient — no new env names required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `FEATURE_VIDEO_ENABLED=true` (for camera)

## What you must do once in Supabase (manual)

### Already done for project `flownic` (pqqlppquqvarszinjskf)

The `guest_practice_sessions` migration was applied via CLI (`supabase db push`).

If you use a **different** Supabase project, run this SQL in **SQL Editor**:

`supabase/migrations/20260728010000_guest_practice_sessions.sql`

### Optional later

- Full MVP schema is in `supabase/pending/full_mvp_schema.sql` (not required for peer tryout).
- Anonymous Auth is not required for the current guest-cookie path.

## Verify locally

1. Restart `pnpm dev` after env/migration.
2. Browser A: `/practice` → Start peer practice → copy invite link.
3. Browser B (incognito or other browser): open invite → join.
4. Both should see role-specific instructions; video tiles appear when LiveKit connects.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Error mentioning Supabase / migration | Table missing — run SQL above |
| Invite not found in second browser | Old in-memory session or migration not applied |
| No video | `FEATURE_VIDEO_ENABLED` false, or browser blocked camera, or LiveKit keys missing |
| Create session 500 with RLS / permission | Confirm `SUPABASE_SECRET_KEY` is the **secret** key (not publishable) |
