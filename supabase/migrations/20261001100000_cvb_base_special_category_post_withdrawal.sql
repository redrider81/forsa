-- CVB Base — what happens to special-category-capable content after the
-- client withdraws article 9.2 a consent.
--
-- Model (source-level, deterministic — no text is ever classified):
--
--   ACTIVE     normal processing according to the consent.
--   WITHDRAWN  no active consent, at least one withdrawn. Let T be the
--              latest withdrawn_at. Every consent-scoped row whose relevant
--              timestamp is <= T is RESTRICTED: stored, visible to the
--              client (right of access), but excluded from Carolina's
--              normal operational use and from AI. The application applies
--              this in its single read path (fetchPortalRepositoryData),
--              using exactly the predicates of erase_special_category_content
--              below. Rows written after T are new data, given under the
--              instruction not to share sensitive personal data.
--   (re-grant) a new consent row; state is ACTIVE again.
--
-- Erasure: the client requests erasure of the restricted content; the
-- request is recorded; Carolina (the controller) carries it out. The whole
-- source row/field is erased, because ordinary and special-category data in
-- free text cannot be separated deterministically.
--
-- Never touched: contracts, signatures, withdrawal records, confirmations,
-- consent audit rows, sessions as appointments (only their free-text focus
-- fields are cleared), bookings, materials/documents (not consent-scoped).
--
-- Consent-scoped sources and their predicate (restricted/erased when true).
-- Every timestamp used is one a later edit cannot move past T, so content
-- written before the withdrawal can never become unrestricted by an update:
--   reflections              created_at <= T
--   insights                 created_at <= T
--   commitments              created_at <= T                 (whole row, incl. client_note)
--   session_preparations     coalesce(client_saved_at, -inf) <= T
--                            (client_saved_at is set only when the client
--                             saves; a coach's follow_up edit does not move it)
--   session_coach_notes      created_at <= T
--   session_summaries        approved_at is null or approved_at <= T
--   sessions                 created_at <= T                 (client_focus, desired_outcome)
--   development_goals        always while WITHDRAWN          (client_wording, baseline)
--   clients.recurring_themes always while WITHDRAWN

-- ------------------------------------------------- 0. who last wrote a preparation
--
-- The preparation row is shared: the client writes focus/desired_outcome/
-- changed/follow_up, the coach's meeting workspace upserts follow_up. Only a
-- client save marks the row as newly written by the client. Set by trigger,
-- never by the caller.

alter table public.session_preparations add column client_saved_at timestamptz;

create or replace function public.session_preparations_track_client_save()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.current_client_id() is not null then
    new.client_saved_at := now();
  elsif tg_op = 'UPDATE' then
    new.client_saved_at := old.client_saved_at;
  else
    new.client_saved_at := null;
  end if;
  return new;
end;
$$;

create trigger session_preparations_track_client_save
  before insert or update on public.session_preparations
  for each row execute function public.session_preparations_track_client_save();

revoke execute on function public.session_preparations_track_client_save() from public, anon, authenticated;

-- ------------------------------------------------- 1. state helper

-- NULL unless the client is WITHDRAWN; then the latest withdrawal time.
create or replace function public.special_category_restriction_cutoff(p_client_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from public.special_category_consents
      where client_id = p_client_id and withdrawn_at is null
    ) then null
    else (
      select max(withdrawn_at) from public.special_category_consents
      where client_id = p_client_id
    )
  end;
$$;

revoke execute on function public.special_category_restriction_cutoff(uuid) from public, anon, authenticated;

-- ------------------------------------------------- 2. erasure requests (audit)

create table public.special_category_erasure_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  -- The withdrawn consent the request refers to, and its withdrawal time:
  -- everything restricted at that moment is what gets erased.
  consent_id uuid not null references public.special_category_consents(id) on delete cascade,
  cutoff timestamptz not null,
  requested_at timestamptz not null default now(),
  requested_by_auth_user_id uuid not null references auth.users(id),
  completed_at timestamptz,
  completed_by_auth_user_id uuid references auth.users(id),
  constraint special_category_erasure_requests_completion_pair
    check ((completed_at is null) = (completed_by_auth_user_id is null))
);

create unique index special_category_erasure_requests_one_open_idx
  on public.special_category_erasure_requests (client_id)
  where completed_at is null;

-- Only the completion transition is allowed.
create or replace function public.special_category_erasure_requests_guard_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.completed_at is not null
     or new.completed_at is null
     or new.id <> old.id
     or new.client_id <> old.client_id
     or new.consent_id <> old.consent_id
     or new.cutoff <> old.cutoff
     or new.requested_at <> old.requested_at
     or new.requested_by_auth_user_id <> old.requested_by_auth_user_id then
    raise exception 'special_category_erasure_requests: only completion of an open request is allowed';
  end if;
  return new;
end;
$$;

create trigger special_category_erasure_requests_guard_update
  before update on public.special_category_erasure_requests
  for each row execute function public.special_category_erasure_requests_guard_update();

revoke execute on function public.special_category_erasure_requests_guard_update() from public, anon, authenticated;

alter table public.special_category_erasure_requests enable row level security;

create policy special_category_erasure_requests_select_klient on public.special_category_erasure_requests
  for select to authenticated
  using (client_id = public.current_client_id());

create policy special_category_erasure_requests_select_coach on public.special_category_erasure_requests
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

grant select on table public.special_category_erasure_requests to authenticated;

-- ------------------------------------------------- 3. client requests erasure

create or replace function public.request_special_category_erasure()
returns table (request_id uuid, requested_at timestamptz, already_requested boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_cutoff timestamptz;
  v_consent_id uuid;
  v_open public.special_category_erasure_requests%rowtype;
begin
  v_client_id := public.current_client_id();
  if v_client_id is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  perform 1 from public.clients where id = v_client_id for update;

  select * into v_open
  from public.special_category_erasure_requests r
  where r.client_id = v_client_id and r.completed_at is null;

  if v_open.id is not null then
    request_id := v_open.id;
    requested_at := v_open.requested_at;
    already_requested := true;
    return next;
    return;
  end if;

  v_cutoff := public.special_category_restriction_cutoff(v_client_id);
  if v_cutoff is null then
    raise exception 'CONSENT_NOT_WITHDRAWN';
  end if;

  select s.id into v_consent_id
  from public.special_category_consents s
  where s.client_id = v_client_id and s.withdrawn_at = v_cutoff
  order by s.granted_at desc
  limit 1;

  insert into public.special_category_erasure_requests (client_id, consent_id, cutoff, requested_by_auth_user_id)
  values (v_client_id, v_consent_id, v_cutoff, auth.uid())
  returning id, special_category_erasure_requests.requested_at into request_id, requested_at;

  already_requested := false;
  return next;
end;
$$;

-- ------------------------------------------------- 4. Carolina carries it out

create or replace function public.erase_special_category_content(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.special_category_erasure_requests%rowtype;
  v_cutoff timestamptz;
begin
  if public.current_coach_id() is null or not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_request
  from public.special_category_erasure_requests
  where client_id = p_client_id and completed_at is null
  for update;

  if v_request.id is null then
    raise exception 'NO_OPEN_ERASURE_REQUEST';
  end if;

  v_cutoff := v_request.cutoff;

  delete from public.reflections where client_id = p_client_id and created_at <= v_cutoff;
  delete from public.insights where client_id = p_client_id and created_at <= v_cutoff;
  delete from public.commitments where client_id = p_client_id and created_at <= v_cutoff;
  delete from public.session_preparations
  where client_id = p_client_id and coalesce(client_saved_at, '-infinity'::timestamptz) <= v_cutoff;

  delete from public.session_coach_notes n
  using public.sessions s
  where s.id = n.session_id and s.client_id = p_client_id and n.created_at <= v_cutoff;

  delete from public.session_summaries m
  using public.sessions s
  where s.id = m.session_id and s.client_id = p_client_id
    and (m.approved_at is null or m.approved_at <= v_cutoff);

  -- Sessions stay as appointments; only their free-text content is cleared.
  update public.sessions
  set client_focus = '', desired_outcome = ''
  where client_id = p_client_id and created_at <= v_cutoff;

  update public.development_goals
  set client_wording = '', baseline = ''
  where client_id = p_client_id;

  update public.clients
  set recurring_themes = '{}'
  where id = p_client_id;

  update public.special_category_erasure_requests
  set completed_at = now(), completed_by_auth_user_id = auth.uid()
  where id = v_request.id;
end;
$$;

grant execute on function public.request_special_category_erasure() to authenticated;
grant execute on function public.erase_special_category_content(uuid) to authenticated;
revoke execute on function public.request_special_category_erasure() from public, anon;
revoke execute on function public.erase_special_category_content(uuid) from public, anon;
