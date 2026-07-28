-- Add transcript, auto follow-ups, and practice report storage for guest sessions.

alter table public.guest_practice_sessions
  add column if not exists transcript_segments jsonb not null default '[]'::jsonb,
  add column if not exists follow_up_suggestions jsonb not null default '[]'::jsonb,
  add column if not exists practice_report jsonb;
