-- CVB Base — CVB-CR-20261015-01 Client & Session Management.
--
-- Additive only: three coach RPCs, no table, column, policy or data change.
-- Existing clients, sessions, bookings and accounts are not touched.
--
-- A. Client details (name, role, email, phone — the fields the client may
--    already edit herself through update_own_client_profile). Carolina's
--    session may still UPDATE public.clients directly under
--    clients_write_coach; the portal uses these functions instead so that an
--    email correction can never leave the client row, the profile and the
--    Supabase Auth account pointing at different addresses.
--
--    begin_coach_client_update   validates and reports the plan; writes
--                                nothing. Tells the server whether a linked
--                                auth account must be re-addressed first.
--    update_coach_client_details writes, under a row lock on the client,
--                                after re-validating everything. When the
--                                email changes for a client with a portal
--                                account, it refuses unless that same
--                                account (same auth.users id — the link is
--                                never re-pointed) already carries the new
--                                address. Profile email and name follow.
--
--    Conflicts are refused, never repaired: an address used by another
--    account, another client or a coach; an invitation being sent right now.
--
-- B. register_manual_coaching_session: Carolina records a session that has
--    already taken place, from the client view, without a booking. One row
--    in public.sessions with status 'genomford', numbered like
--    accept_session_booking does (max + 1 per client, under a row lock on
--    the client). No booking request, public reservation, notification or
--    invitation row is created, so no email can follow. Existing sessions
--    are never updated. Future sessions and overlapping sessions for the
--    same client are refused.
--
-- Repeatable: create or replace throughout.

-- ------------------------------------------------------------ shared check

create or replace function public.coach_client_details_check(
  p_client_id uuid,
  p_name text,
  p_role text,
  p_email text,
  p_phone text,
  p_initials text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_client public.clients%rowtype;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := btrim(coalesce(p_name, ''));
  v_role text := btrim(coalesce(p_role, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_initials text := btrim(coalesce(p_initials, ''));
  v_changed boolean;
  v_linked_id uuid;
  v_linked_email text;
  v_linked_confirmed boolean := false;
begin
  if public.current_coach_id() is null then
    raise exception 'NOT_COACH';
  end if;
  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'CLIENT_NOT_FOUND';
  end if;

  if length(v_name) < 1 or length(v_name) > 120 then
    raise exception 'INVALID_NAME';
  end if;
  if length(v_role) < 1 or length(v_role) > 120 then
    raise exception 'INVALID_ROLE';
  end if;
  if length(v_phone) > 40 then
    raise exception 'INVALID_PHONE';
  end if;
  if length(v_initials) < 1 or length(v_initials) > 4 then
    raise exception 'INVALID_NAME';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'INVALID_EMAIL';
  end if;

  select * into v_client from public.clients where id = p_client_id;
  v_changed := lower(btrim(coalesce(v_client.email, ''))) <> v_email;

  select p.id, u.email, u.email_confirmed_at is not null
    into v_linked_id, v_linked_email, v_linked_confirmed
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.client_id = p_client_id;

  if v_changed then
    -- Any other account, any other client, any coach already using it.
    if exists (select 1 from auth.users u where lower(u.email) = v_email and u.id is distinct from v_linked_id)
       or exists (select 1 from public.clients c where c.id <> p_client_id and lower(btrim(c.email)) = v_email)
       or exists (select 1 from public.coaches co where lower(btrim(co.email)) = v_email) then
      raise exception 'EMAIL_IN_USE';
    end if;

    -- An invitation being delivered right now goes to the current address.
    if exists (
      select 1 from public.client_invitations i
      where i.client_id = p_client_id
        and i.status = 'pending'
        and i.last_attempt_at > now() - interval '2 minutes'
    ) then
      raise exception 'INVITATION_IN_PROGRESS';
    end if;
  end if;

  return jsonb_build_object(
    'email', v_email,
    'previous_email', v_client.email,
    'email_changed', v_changed,
    'auth_user_id', v_linked_id,
    'auth_user_email', v_linked_email,
    'auth_user_confirmed', coalesce(v_linked_confirmed, false)
  );
end;
$$;

-- Internal: reachable only through the two functions below.
revoke execute on function public.coach_client_details_check(uuid, text, text, text, text, text) from public, anon, authenticated;

-- ------------------------------------------------------------ A1. begin

create or replace function public.begin_coach_client_update(
  p_client_id uuid,
  p_name text,
  p_role text,
  p_email text,
  p_phone text,
  p_initials text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_plan jsonb;
begin
  v_plan := public.coach_client_details_check(p_client_id, p_name, p_role, p_email, p_phone, p_initials);
  -- The server needs the account id and confirmation state to re-address
  -- the account; the account's current address is not exposed.
  return v_plan - 'auth_user_email';
end;
$$;

-- ------------------------------------------------------------ A2. update

create or replace function public.update_coach_client_details(
  p_client_id uuid,
  p_name text,
  p_role text,
  p_email text,
  p_phone text,
  p_initials text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan jsonb;
  v_linked_id uuid;
begin
  if public.current_coach_id() is null then
    raise exception 'NOT_COACH';
  end if;
  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'CLIENT_NOT_FOUND';
  end if;

  -- Serialises with begin_client_invitation and concurrent edits.
  perform 1 from public.clients where id = p_client_id for update;

  v_plan := public.coach_client_details_check(p_client_id, p_name, p_role, p_email, p_phone, p_initials);
  v_linked_id := nullif(v_plan ->> 'auth_user_id', '')::uuid;

  if (v_plan ->> 'email_changed')::boolean
     and v_linked_id is not null
     and lower(coalesce(v_plan ->> 'auth_user_email', '')) <> (v_plan ->> 'email') then
    raise exception 'AUTH_EMAIL_NOT_SYNCED';
  end if;

  update public.clients
  set name = btrim(p_name),
      initials = btrim(p_initials),
      role = btrim(p_role),
      email = case when (v_plan ->> 'email_changed')::boolean then v_plan ->> 'email' else email end,
      phone = btrim(coalesce(p_phone, '')),
      updated_at = now()
  where id = p_client_id;

  if v_linked_id is not null then
    update public.profiles
    set email = case when (v_plan ->> 'email_changed')::boolean then v_plan ->> 'email' else email end,
        name = left(btrim(p_name), 120)
    where id = v_linked_id and client_id = p_client_id;
  end if;

  return jsonb_build_object('email_changed', (v_plan ->> 'email_changed')::boolean);
end;
$$;

-- ------------------------------------------------------------ B. manual session

create or replace function public.register_manual_coaching_session(
  p_client_id uuid,
  p_date date,
  p_start_time text,
  p_end_time text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tz constant text := 'Europe/Stockholm';
  v_start_minutes int;
  v_end_minutes int;
  v_duration int;
  v_next_number int;
  v_session_id uuid;
begin
  if public.current_coach_id() is null then
    raise exception 'NOT_COACH';
  end if;
  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'CLIENT_NOT_FOUND';
  end if;

  if p_date is null
     or coalesce(p_start_time, '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
     or coalesce(p_end_time, '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
    raise exception 'INVALID_TIME';
  end if;

  v_start_minutes := split_part(p_start_time, ':', 1)::int * 60 + split_part(p_start_time, ':', 2)::int;
  v_end_minutes := split_part(p_end_time, ':', 1)::int * 60 + split_part(p_end_time, ':', 2)::int;
  v_duration := v_end_minutes - v_start_minutes;
  if v_duration <= 0 or v_duration > 480 then
    raise exception 'INVALID_INTERVAL';
  end if;

  -- Only a session that has already ended may be recorded.
  if ((p_date::text || ' ' || p_end_time)::timestamp at time zone v_tz) > now() then
    raise exception 'SESSION_IN_FUTURE';
  end if;

  -- Serialises numbering with accept_session_booking and concurrent saves.
  perform 1 from public.clients where id = p_client_id for update;

  -- A second registration of the same session (or an overlapping one).
  if exists (
    select 1 from public.sessions s
    where s.client_id = p_client_id
      and s.date = p_date
      and s.time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      and (split_part(s.time, ':', 1)::int * 60 + split_part(s.time, ':', 2)::int) < v_end_minutes
      and (split_part(s.time, ':', 1)::int * 60 + split_part(s.time, ':', 2)::int) + greatest(s.duration_minutes, 1) > v_start_minutes
  ) then
    raise exception 'SESSION_OVERLAP';
  end if;

  select coalesce(max(number), 0) + 1 into v_next_number
  from public.sessions where client_id = p_client_id;

  insert into public.sessions (client_id, number, date, time, duration_minutes, status)
  values (p_client_id, v_next_number, p_date, p_start_time, v_duration, 'genomford')
  returning id into v_session_id;

  return v_session_id;
end;
$$;

-- ------------------------------------------------------------ privileges

revoke execute on function public.begin_coach_client_update(uuid, text, text, text, text, text) from public, anon;
revoke execute on function public.update_coach_client_details(uuid, text, text, text, text, text) from public, anon;
revoke execute on function public.register_manual_coaching_session(uuid, date, text, text) from public, anon;

grant execute on function public.begin_coach_client_update(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.update_coach_client_details(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.register_manual_coaching_session(uuid, date, text, text) to authenticated;
