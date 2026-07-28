# Full MVP schema (booking, sessions, RLS, etc.)

Not applied yet to the linked Flownic project. Guest practice only needs
`supabase/migrations/20260728010000_guest_practice_sessions.sql` (already applied).

Before applying this file:

1. A previous push attempt failed mid-way because `current_role` is reserved in Postgres
   (column was renamed to `active_role` in this file).
2. Check the remote DB for any partial tables from that attempt and drop them if needed.
3. Then move this file into `supabase/migrations/` with a new timestamp and run
   `supabase db push`.

Until then, keep using the guest practice table for two-browser peer testing.
