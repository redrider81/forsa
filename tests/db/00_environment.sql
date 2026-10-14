-- CVB Base DB integration tests — environment (runs as supabase_admin,
-- before the migrations).
--
-- The Supabase Postgres image grants ALL on new public tables, EXECUTE on new
-- functions and USAGE on new sequences to anon, authenticated and
-- service_role. The production project does not: new objects get no data
-- privileges at all. Testing against the image defaults hides every missing
-- GRANT (the calendar and coach-profile faults of 2026-10-14). These are the
-- production defaults, verified against pg_default_acl in production.

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;

-- The bare image ships a minimal auth.users; the Auth service adds this
-- column on the platform, and two functions read it.
alter table auth.users add column if not exists email_confirmed_at timestamptz;

-- Minimal Storage schema (the Storage service creates it on the platform),
-- enough for the bucket and policy migrations to apply in full.
create schema if not exists storage authorization postgres;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null,
  owner uuid,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table storage.buckets owner to postgres;
alter table storage.objects owner to postgres;
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text)
returns text[]
language sql
immutable
as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1];
$$;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
