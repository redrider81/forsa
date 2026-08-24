-- CVB Base — production schema foundation.
-- Mirrors the existing TypeScript domain model in src/lib/portal/types.ts.
-- Organisation → Uppdrag → Klient → Coachningsöverenskommelse → Utvecklingsmål →
-- Session → Reflektion → Insikt → Åtagande → Uppföljning.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- enums

create type public.portal_role as enum ('coach', 'klient');
create type public.confidentiality_level as enum ('coach', 'coach_klient', 'organisation');
create type public.engagement_kind as enum ('individuell', 'ledarutveckling', 'program');
create type public.engagement_status as enum ('planering', 'pagaende', 'avslutat');
create type public.session_status as enum ('genomford', 'kommande');
create type public.commitment_status as enum ('oppet', 'pagar', 'genomfort');
create type public.milestone_status as enum ('genomford', 'pagaende', 'kommande');
create type public.client_depth as enum ('full', 'oversikt');
create type public.material_category as enum ('arbetsmaterial', 'underlag', 'utvardering', 'anteckning', 'ovrigt');
create type public.material_source as enum ('client_upload', 'client_note', 'coach_shared');
create type public.material_sharing_level as enum ('private', 'shared_coach');
create type public.material_link_type as enum ('goal', 'next_session', 'session', 'commitment', 'none');
create type public.document_owner_type as enum ('klient', 'uppdrag');
create type public.material_created_by_role as enum ('klient', 'coach');

-- ---------------------------------------------------------------- coaches

create table public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  initials text not null,
  email text not null unique,
  credential text not null,
  focus text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------ organisations

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size_label text not null,
  industry text not null,
  location text not null,
  sponsor_name text,
  sponsor_role text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------- engagements

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  coach_id uuid not null references public.coaches (id) on delete restrict,
  title text not null,
  kind public.engagement_kind not null,
  kind_label text not null,
  purpose text not null,
  scope_note text not null,
  period_label text not null,
  start_date date not null,
  end_date date not null,
  status public.engagement_status not null,
  sponsor_reporting text not null,
  next_review_label text,
  next_review_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index engagements_organisation_id_idx on public.engagements (organisation_id);
create index engagements_coach_id_idx on public.engagements (coach_id);

-- --------------------------------------------------------------- milestones

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  label text not null,
  date date not null,
  status public.milestone_status not null
);

create index milestones_engagement_id_idx on public.milestones (engagement_id);

-- ------------------------------------------------------------------ clients

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements (id) on delete restrict,
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  name text not null,
  initials text not null,
  role text not null,
  email text not null,
  phone text not null default '',
  headline text not null default '',
  started_at date not null,
  depth public.client_depth not null default 'full',
  recurring_themes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_engagement_id_idx on public.clients (engagement_id);
create index clients_organisation_id_idx on public.clients (organisation_id);

-- --------------------------------------------------------- coaching_agreements

create table public.coaching_agreements (
  client_id uuid primary key references public.clients (id) on delete cascade,
  agreed_at date not null,
  purpose text not null,
  scope text not null,
  cadence text not null,
  confidentiality text not null,
  sponsor_sharing text not null,
  ethics text not null,
  client_responsibility text not null
);

-- ----------------------------------------------------------- development_goals

create table public.development_goals (
  client_id uuid primary key references public.clients (id) on delete cascade,
  headline text not null,
  client_wording text not null,
  baseline text not null,
  success_criteria text[] not null default '{}',
  horizon text not null
);

-- ------------------------------------------------------------------ sessions

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  number int not null,
  date date not null,
  time text not null default '',
  duration_minutes int not null default 0,
  status public.session_status not null,
  client_focus text not null default '',
  desired_outcome text not null default '',
  location text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, number)
);

create index sessions_client_id_idx on public.sessions (client_id);

-- ----------------------------------------------------------- session_coach_notes
-- Private coaching notes. Deliberately isolated in their own table (never a
-- column on `sessions`) so the confidentiality boundary is structural, not a
-- filtered view over a client-readable table.

create table public.session_coach_notes (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete restrict,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------ session_summaries

create table public.session_summaries (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  focus text not null default '',
  insights text[] not null default '{}',
  awareness text not null default '',
  new_perspectives text[] not null default '{}',
  commitments text[] not null default '{}',
  follow_up text[] not null default '{}',
  possible_next_focus text not null default '',
  approved boolean not null default false,
  approved_at timestamptz
);

-- --------------------------------------------------------- session_preparations
-- Client-submitted preparation ahead of the upcoming session. Kept keyed by
-- client (one active preparation at a time), matching the existing
-- DemoSessionPrep contract (focus, desiredOutcome, changed, followUp).

create table public.session_preparations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  focus text not null default '',
  desired_outcome text not null default '',
  changed text not null default '',
  follow_up text not null default '',
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ reflections

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  date date not null,
  prompt text not null default '',
  text text not null,
  created_at timestamptz not null default now()
);

create index reflections_client_id_idx on public.reflections (client_id);

-- ---------------------------------------------------------------------- insights

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  date date not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index insights_client_id_idx on public.insights (client_id);

-- ------------------------------------------------------------------- commitments

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  date date not null,
  text text not null,
  due_label text not null default '',
  status public.commitment_status not null default 'oppet',
  client_note text,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index commitments_client_id_idx on public.commitments (client_id);

-- --------------------------------------------------------------------- documents
-- Polymorphic owner (klient | uppdrag), matching the existing PortalDocument
-- contract. No FK on owner_id since it can reference either clients or
-- engagements — mirrors the current app's own polymorphic pattern.

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_type public.document_owner_type not null,
  owner_id uuid not null,
  title text not null,
  kind text not null,
  date date not null,
  description text not null default '',
  visibility public.confidentiality_level not null
);

create index documents_owner_idx on public.documents (owner_type, owner_id);

-- --------------------------------------------------------------------- materials

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  owner_client_id uuid not null references public.clients (id) on delete cascade,
  created_by_role public.material_created_by_role not null,
  created_by_id text not null,
  title text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  category public.material_category not null,
  note_text text,
  sharing_level public.material_sharing_level not null,
  source public.material_source not null,
  link_type public.material_link_type not null default 'none',
  linked_session_id uuid references public.sessions (id) on delete set null,
  linked_commitment_id uuid references public.commitments (id) on delete set null,
  comment text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index materials_owner_client_id_idx on public.materials (owner_client_id);

-- ----------------------------------------------------------------------- intakes
-- Minimal foundation for a future public-website intake handoff. No form, no
-- UI, no automation is built in this pass — see migration comment context.

create table public.intakes (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  organisation_name text,
  role text,
  need text,
  background text,
  status text not null default 'new'
    check (status in ('new', 'granskas', 'kvalificerad', 'arkiverad')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------- profiles
-- Links a Supabase Auth user to exactly one CVB Base subject (a coach or a
-- client). Invitation-based — rows are created by the trigger below when an
-- admin invites a user with portal_role/portal_subject_id in user metadata.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.portal_role not null,
  coach_id uuid references public.coaches (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  email text not null,
  name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_subject_matches_role check (
    (role = 'coach' and coach_id is not null and client_id is null)
    or (role = 'klient' and client_id is not null and coach_id is null)
  )
);

create unique index profiles_coach_id_idx on public.profiles (coach_id) where coach_id is not null;
create unique index profiles_client_id_idx on public.profiles (client_id) where client_id is not null;

-- Creates a profile row when an invited auth user is provisioned. The invite
-- itself (via Supabase Admin API) must set raw_user_meta_data.portal_role and
-- .portal_subject_id — no admin UI is built in this pass, invites are issued
-- externally.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := new.raw_user_meta_data ->> 'portal_role';
  v_subject_id uuid := nullif(new.raw_user_meta_data ->> 'portal_subject_id', '')::uuid;
  v_name text := coalesce(new.raw_user_meta_data ->> 'name', new.email);
begin
  if v_role = 'coach' and v_subject_id is not null then
    insert into public.profiles (id, role, coach_id, email, name)
    values (new.id, 'coach', v_subject_id, new.email, v_name);
  elsif v_role = 'klient' and v_subject_id is not null then
    insert into public.profiles (id, role, client_id, email, name)
    values (new.id, 'klient', v_subject_id, new.email, v_name);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
