-- Flownic MVP initial schema
-- Technical guide §19–§20. RLS enabled on every exposed table.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Identity and content
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete restrict,
  display_name text,
  timezone text not null default 'Europe/Berlin',
  ui_locale text not null default 'de' check (ui_locale in ('de', 'en')),
  feedback_locale text not null default 'de' check (feedback_locale in ('de', 'en')),
  age_confirmed boolean not null default false,
  exam_date date,
  acquisition_channel text,
  is_staff boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  target_language text not null,
  status text not null default 'active'
    check (status in ('draft', 'active', 'retired')),
  disclaimer_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blueprint_versions (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.assessment_tracks (id) on delete restrict,
  semantic_version text not null,
  schema_version integer not null default 1,
  content jsonb not null,
  content_hash text not null,
  status text not null default 'draft'
    check (status in ('draft', 'reviewed', 'active', 'retired')),
  reviewer_reference text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (track_id, semantic_version),
  unique (track_id, content_hash)
);

create unique index blueprint_versions_one_active_per_track
  on public.blueprint_versions (track_id)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- Booking and sessions
-- ---------------------------------------------------------------------------

create table public.practice_slots (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.assessment_tracks (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  display_timezone text not null default 'Europe/Berlin',
  capacity integer not null default 2 check (capacity > 0),
  booking_cutoff_at timestamptz not null,
  confirmation_deadline_at timestamptz not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete restrict,
  slot_id uuid not null references public.practice_slots (id) on delete restrict,
  track_id uuid not null references public.assessment_tracks (id) on delete restrict,
  exam_date date,
  status text not null default 'pending_confirmation'
    check (status in (
      'draft',
      'pending_confirmation',
      'confirmed',
      'cancelled',
      'late',
      'no_show',
      'completed'
    )),
  acquisition_channel text,
  confirmed_at timestamptz,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slot_id),
  unique (idempotency_key)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references public.practice_slots (id) on delete restrict,
  track_id uuid not null references public.assessment_tracks (id) on delete restrict,
  blueprint_version_id uuid not null references public.blueprint_versions (id) on delete restrict,
  mode text not null check (mode in ('peer', 'ai_examiner')),
  status text not null default 'scheduled'
    check (status in (
      'scheduled',
      'waiting',
      'in_progress',
      'processing',
      'completed',
      'failed',
      'cancelled'
    )),
  current_round_key text,
  current_stage_key text,
  state_version integer not null default 0,
  stage_started_at timestamptz,
  stage_ends_at timestamptz,
  failure_reason text,
  external_fallback_url text,
  provider_room_name text,
  seeded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete restrict,
  user_id uuid references public.profiles (user_id) on delete restrict,
  actor_type text not null default 'human'
    check (actor_type in ('human', 'ai')),
  initial_role text not null check (initial_role in ('examiner', 'candidate')),
  active_role text not null check (active_role in ('examiner', 'candidate')),
  attendance_state text not null default 'expected'
    check (attendance_state in (
      'expected',
      'joined',
      'ready',
      'left',
      'completed',
      'no_show'
    )),
  joined_at timestamptz,
  left_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id),
  check (
    (actor_type = 'human' and user_id is not null)
    or (actor_type = 'ai' and user_id is null)
  )
);

create table public.session_domain_events (
  id uuid primary key default gen_random_uuid(),
  aggregate_id uuid not null,
  event_type text not null,
  prior_state text,
  new_state text,
  actor_user_id uuid references public.profiles (user_id) on delete restrict,
  reason text,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AI, feedback, operations
-- ---------------------------------------------------------------------------

create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete restrict,
  participant_id uuid not null references public.session_participants (id) on delete restrict,
  round_key text,
  stage_key text,
  sequence integer not null check (sequence >= 0),
  started_at timestamptz,
  ended_at timestamptz,
  text text not null,
  confidence numeric,
  provider_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (session_id, participant_id, sequence)
);

create table public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete restrict,
  recipient_participant_id uuid not null references public.session_participants (id) on delete restrict,
  status text not null default 'queued'
    check (status in ('queued', 'generating', 'ready', 'failed', 'needs_review')),
  schema_version integer not null default 1,
  report jsonb,
  opened_at timestamptz,
  useful_at timestamptz,
  human_review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, recipient_participant_id, schema_version)
);

create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  capability text not null,
  session_id uuid references public.sessions (id) on delete restrict,
  report_id uuid references public.feedback_reports (id) on delete restrict,
  model text not null,
  prompt_version text not null,
  blueprint_version_id uuid references public.blueprint_versions (id) on delete restrict,
  status text not null,
  latency_ms integer,
  usage jsonb not null default '{}'::jsonb,
  estimated_cost_usd numeric,
  input_hash text,
  error text,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  resource_id uuid not null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'dead')),
  attempts integer not null default 0,
  next_attempt_at timestamptz,
  locked_at timestamptz,
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete restrict,
  booking_id uuid references public.bookings (id) on delete restrict,
  session_id uuid references public.sessions (id) on delete restrict,
  template text not null,
  channel text not null default 'email',
  scheduled_at timestamptz,
  sent_at timestamptz,
  provider_status text,
  created_at timestamptz not null default now()
);

create table public.product_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  schema_version integer not null default 1,
  user_id uuid references public.profiles (user_id) on delete restrict,
  session_id uuid references public.sessions (id) on delete restrict,
  track_id uuid references public.assessment_tracks (id) on delete restrict,
  source text not null default 'server',
  properties jsonb not null default '{}'::jsonb,
  dedupe_key text not null unique,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Safety and revenue
-- ---------------------------------------------------------------------------

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete restrict,
  session_id uuid references public.sessions (id) on delete restrict,
  purpose text not null,
  policy_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.profiles (user_id) on delete restrict,
  reported_participant_id uuid references public.session_participants (id) on delete restrict,
  session_id uuid references public.sessions (id) on delete restrict,
  reason text not null,
  details text,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  staff_resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_user_id uuid not null references public.profiles (user_id) on delete restrict,
  blocked_user_id uuid not null references public.profiles (user_id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (blocker_user_id, blocked_user_id),
  check (blocker_user_id <> blocked_user_id)
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete restrict,
  product_code text not null,
  source text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'active'
    check (status in ('active', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete restrict,
  offer_code text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  provider_reference text,
  status text not null
    check (status in ('pending', 'paid', 'failed', 'refunded', 'manual')),
  recorded_by uuid references public.profiles (user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid not null references public.profiles (user_id) on delete restrict,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  change_summary text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger assessment_tracks_set_updated_at
  before update on public.assessment_tracks
  for each row execute function public.set_updated_at();

create trigger blueprint_versions_set_updated_at
  before update on public.blueprint_versions
  for each row execute function public.set_updated_at();

create trigger practice_slots_set_updated_at
  before update on public.practice_slots
  for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

create trigger session_participants_set_updated_at
  before update on public.session_participants
  for each row execute function public.set_updated_at();

create trigger feedback_reports_set_updated_at
  before update on public.feedback_reports
  for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger moderation_reports_set_updated_at
  before update on public.moderation_reports
  for each row execute function public.set_updated_at();

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();

create trigger payment_records_set_updated_at
  before update on public.payment_records
  for each row execute function public.set_updated_at();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_staff from public.profiles where user_id = auth.uid()),
    false
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.assessment_tracks enable row level security;
alter table public.blueprint_versions enable row level security;
alter table public.practice_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.session_domain_events enable row level security;
alter table public.transcript_segments enable row level security;
alter table public.feedback_reports enable row level security;
alter table public.ai_runs enable row level security;
alter table public.jobs enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.product_events enable row level security;
alter table public.consents enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.user_blocks enable row level security;
alter table public.entitlements enable row level security;
alter table public.payment_records enable row level security;
alter table public.admin_audit_log enable row level security;

-- Profiles
create policy profiles_select_own_or_staff
  on public.profiles for select
  using (user_id = auth.uid() or public.is_staff());

create policy profiles_update_own
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_staff = (select p.is_staff from public.profiles p where p.user_id = auth.uid()));

-- Tracks / published slots (read)
create policy assessment_tracks_select_active
  on public.assessment_tracks for select
  using (status = 'active' or public.is_staff());

create policy practice_slots_select_published
  on public.practice_slots for select
  using (status = 'published' or public.is_staff());

-- Blueprint versions: no direct browser access to content for users
create policy blueprint_versions_staff_only
  on public.blueprint_versions for select
  using (public.is_staff());

-- Bookings
create policy bookings_select_own_or_staff
  on public.bookings for select
  using (user_id = auth.uid() or public.is_staff());

create policy bookings_insert_own
  on public.bookings for insert
  with check (user_id = auth.uid());

create policy bookings_update_own_or_staff
  on public.bookings for update
  using (user_id = auth.uid() or public.is_staff());

-- Sessions: participants + staff
create policy sessions_select_participant_or_staff
  on public.sessions for select
  using (
    public.is_staff()
    or exists (
      select 1
      from public.session_participants sp
      where sp.session_id = sessions.id
        and sp.user_id = auth.uid()
    )
  );

create policy session_participants_select_own_session_or_staff
  on public.session_participants for select
  using (
    public.is_staff()
    or user_id = auth.uid()
    or exists (
      select 1
      from public.session_participants me
      where me.session_id = session_participants.session_id
        and me.user_id = auth.uid()
    )
  );

-- Feedback: recipient only (via participant ownership)
create policy feedback_reports_select_recipient_or_staff
  on public.feedback_reports for select
  using (
    public.is_staff()
    or exists (
      select 1
      from public.session_participants sp
      where sp.id = feedback_reports.recipient_participant_id
        and sp.user_id = auth.uid()
    )
  );

-- Consents / blocks / entitlements / payments (own)
create policy consents_select_own_or_staff
  on public.consents for select
  using (user_id = auth.uid() or public.is_staff());

create policy consents_insert_own
  on public.consents for insert
  with check (user_id = auth.uid());

create policy user_blocks_select_own_or_staff
  on public.user_blocks for select
  using (blocker_user_id = auth.uid() or public.is_staff());

create policy user_blocks_insert_own
  on public.user_blocks for insert
  with check (blocker_user_id = auth.uid());

create policy entitlements_select_own_or_staff
  on public.entitlements for select
  using (user_id = auth.uid() or public.is_staff());

create policy payment_records_select_own_or_staff
  on public.payment_records for select
  using (user_id = auth.uid() or public.is_staff());

create policy moderation_reports_select_reporter_or_staff
  on public.moderation_reports for select
  using (reporter_user_id = auth.uid() or public.is_staff());

create policy moderation_reports_insert_own
  on public.moderation_reports for insert
  with check (reporter_user_id = auth.uid());

create policy notification_deliveries_select_own_or_staff
  on public.notification_deliveries for select
  using (user_id = auth.uid() or public.is_staff());

-- Privileged tables: staff only (no user policies beyond staff)
create policy session_domain_events_staff_only
  on public.session_domain_events for select
  using (public.is_staff());

create policy transcript_segments_staff_only
  on public.transcript_segments for select
  using (public.is_staff());

create policy ai_runs_staff_only
  on public.ai_runs for select
  using (public.is_staff());

create policy jobs_staff_only
  on public.jobs for select
  using (public.is_staff());

create policy product_events_staff_only
  on public.product_events for select
  using (public.is_staff());

create policy admin_audit_log_staff_only
  on public.admin_audit_log for select
  using (public.is_staff());

-- Seed track
insert into public.assessment_tracks (slug, name, target_language, status, disclaimer_version)
values (
  'telc-de-b1-speaking',
  'telc Deutsch B1 Speaking (practice)',
  'de',
  'active',
  '2026-07-01'
);
