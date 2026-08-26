-- Client lifecycle: AKTIV -> AVSLUTAD -> (ÅTERAKTIVERA | RADERA PERMANENT).
-- Ending a client preserves all history. Permanent deletion is only ever
-- available for an already-ended client, and only when no signed/locked
-- contract or unsafe stored file would be orphaned.

create type public.client_lifecycle_status as enum ('aktiv', 'avslutad');

alter table public.clients
  add column status public.client_lifecycle_status not null default 'aktiv',
  add column ended_at timestamptz,
  add column reactivated_at timestamptz;

-- The existing `clients_write_coach` policy grants coaches broad ALL access
-- to their own clients (unchanged, not modified here). A restrictive policy
-- narrows DELETE specifically: direct browser-initiated deletes are always
-- denied, so permanent deletion is only possible through the
-- delete_coach_client() security-definer RPC below, which runs its own
-- ownership, status, and safety checks atomically.

create policy clients_delete_blocked on public.clients
  as restrictive
  for delete to authenticated
  using (false);

-- ---------------------------------------------------------------- end/reactivate

create or replace function public.end_coach_client(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'Client not found or unauthorized';
  end if;

  update public.clients
  set status = 'avslutad', ended_at = now(), updated_at = now()
  where id = p_client_id;
end;
$$;

create or replace function public.reactivate_coach_client(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_status public.client_lifecycle_status;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'Client not found or unauthorized';
  end if;

  select status into v_status from public.clients where id = p_client_id for update;

  if v_status <> 'avslutad' then
    raise exception 'Client is not ended';
  end if;

  update public.clients
  set status = 'aktiv', reactivated_at = now(), updated_at = now()
  where id = p_client_id;
end;
$$;

-- ---------------------------------------------------------------- permanent delete

create or replace function public.delete_coach_client(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_status public.client_lifecycle_status;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'Client not found or unauthorized';
  end if;

  select status into v_status from public.clients where id = p_client_id for update;

  if v_status <> 'avslutad' then
    raise exception 'Client is not ended';
  end if;

  if exists (
    select 1 from public.contracts
    where client_id = p_client_id and status <> 'utkast'
  ) then
    raise exception 'SIGNED_CONTRACT_BLOCK';
  end if;

  if exists (
    select 1 from public.documents
    where owner_type = 'klient' and owner_id = p_client_id
  ) then
    raise exception 'DOCUMENT_BLOCK';
  end if;

  if exists (
    select 1 from public.materials
    where owner_client_id = p_client_id and storage_path is not null
  ) then
    raise exception 'DOCUMENT_BLOCK';
  end if;

  -- Remaining dependent data (sessions, commitments, reflections, insights,
  -- coaching_agreements, development_goals, session_preparations,
  -- session_booking_requests, materials without a stored file, draft
  -- contracts) cascades via existing FK `on delete cascade`. profiles.client_id
  -- is `on delete set null` — the auth account itself is never touched.
  delete from public.clients where id = p_client_id;
end;
$$;

grant execute on function public.end_coach_client(uuid) to authenticated;
grant execute on function public.reactivate_coach_client(uuid) to authenticated;
grant execute on function public.delete_coach_client(uuid) to authenticated;

revoke execute on function public.end_coach_client(uuid) from public, anon;
revoke execute on function public.reactivate_coach_client(uuid) from public, anon;
revoke execute on function public.delete_coach_client(uuid) from public, anon;
