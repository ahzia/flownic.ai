-- Guest practice sessions for account-free peer / AI tryout.
-- Accessed only via server secret key (bypasses RLS; no browser policies).

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.guest_practice_sessions (
  id uuid primary key,
  mode text not null check (mode in ('peer', 'ai_examiner')),
  status text not null check (status in (
    'scheduled',
    'waiting',
    'in_progress',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )),
  invite_token text not null unique,
  host_guest_key text not null,
  state_version integer not null default 1,
  current_round_index integer not null default 0,
  current_stage_index integer not null default 0,
  stage_started_at timestamptz,
  stage_ends_at timestamptz,
  participants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guest_practice_sessions_invite_token_idx
  on public.guest_practice_sessions (invite_token);

create index if not exists guest_practice_sessions_updated_at_idx
  on public.guest_practice_sessions (updated_at desc);

drop trigger if exists guest_practice_sessions_set_updated_at on public.guest_practice_sessions;
create trigger guest_practice_sessions_set_updated_at
  before update on public.guest_practice_sessions
  for each row execute function public.set_updated_at();

alter table public.guest_practice_sessions enable row level security;

revoke all on table public.guest_practice_sessions from anon, authenticated;
