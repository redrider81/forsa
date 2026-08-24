-- CVB Base — hardening pass on the schema/RLS foundation, per Supabase
-- security/performance advisors run immediately after the initial migration.
-- No new tables, columns, or capabilities — only: a missing search_path on
-- one trigger function, wrapping auth.uid() so it isn't re-evaluated per row,
-- and covering indexes for foreign keys the advisor flagged as missing.

-- Fix: mutable search_path on the materials identity-lock trigger function.
create or replace function public.materials_lock_identity_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.owner_client_id <> old.owner_client_id
     or new.created_by_role <> old.created_by_role
     or new.created_by_id <> old.created_by_id
     or new.source <> old.source then
    raise exception 'materials: owner_client_id, created_by_role, created_by_id and source are immutable';
  end if;
  return new;
end;
$$;

-- Fix: auth.uid() re-evaluated per row in the profiles policy.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- Fix: missing covering indexes on foreign keys.
create index if not exists commitments_session_id_idx on public.commitments (session_id);
create index if not exists insights_session_id_idx on public.insights (session_id);
create index if not exists materials_linked_session_id_idx on public.materials (linked_session_id);
create index if not exists materials_linked_commitment_id_idx on public.materials (linked_commitment_id);
create index if not exists reflections_session_id_idx on public.reflections (session_id);
create index if not exists session_coach_notes_coach_id_idx on public.session_coach_notes (coach_id);
create index if not exists session_preparations_session_id_idx on public.session_preparations (session_id);
