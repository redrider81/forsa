-- CVB Base — booking integrity corrections.
--
-- The public booking model stays frozen: Monday–Friday only, exactly four
-- fixed two-hour blocks (08–10, 10–12, 13–15, 15–17), 12:00–13:00 always
-- lunch. Nothing here reintroduces dynamic slot generation, and public
-- validation never consults meeting_duration_minutes or buffer_minutes.
--
-- Internal coach/client bookings stay flexible: arbitrary clock times and
-- weekends remain valid for them. They only gain a coach-wide conflict
-- check so an accepted internal booking can never double-book a coach.

-- ------------------------------------------------- 1. internal helper is private
--
-- resolve_availability_windows is an internal SECURITY DEFINER helper. The
-- public-facing functions below call it as the function owner, so revoking
-- direct EXECUTE does not affect them — it only stops callers from reading
-- a coach's raw availability rules/exceptions by coach_id.

revoke execute on function public.resolve_availability_windows(uuid, date) from public;
revoke execute on function public.resolve_availability_windows(uuid, date) from anon;
revoke execute on function public.resolve_availability_windows(uuid, date) from authenticated;

-- ------------------------------------------------- 2. strict public reservation
--
-- Every property the browser could lie about is re-derived and re-checked
-- here. Shape problems (null, wrong length, cross-midnight, weekend, not a
-- fixed block) raise INVALID_SLOT. A well-formed block that simply cannot
-- be taken raises SLOT_UNAVAILABLE.
--
-- The exact-2-hour check is safe despite DST: Europe/Stockholm transitions
-- happen at 03:00 on a Sunday, and public booking is Monday–Friday only, so
-- no transition can ever fall inside one of the four blocks.

create or replace function public.create_public_booking_request(
  p_slug text,
  p_name text,
  p_email text,
  p_phone text,
  p_message text,
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.coach_booking_settings%rowtype;
  v_coach_id uuid;
  v_local_date date;
  v_local_end_date date;
  v_local_start time;
  v_local_end time;
  v_local_today date;
  v_local_horizon_end date;
  v_request_id uuid;
begin
  select cbs.* into v_settings from public.coach_booking_settings cbs where cbs.public_slug = p_slug;
  if v_settings.coach_id is null or not v_settings.public_booking_enabled then
    raise exception 'BOOKING_DISABLED';
  end if;
  v_coach_id := v_settings.coach_id;

  if p_name is null or trim(p_name) = '' or p_email is null or trim(p_email) = '' then
    raise exception 'INVALID_REQUEST';
  end if;

  -- --- shape: everything below is INVALID_SLOT, never SLOT_UNAVAILABLE ---

  if p_start_at is null or p_end_at is null then
    raise exception 'INVALID_SLOT';
  end if;

  if p_end_at <= p_start_at then
    raise exception 'INVALID_SLOT';
  end if;

  if p_end_at - p_start_at <> interval '2 hours' then
    raise exception 'INVALID_SLOT';
  end if;

  v_local_date := (p_start_at at time zone v_settings.timezone)::date;
  v_local_end_date := (p_end_at at time zone v_settings.timezone)::date;
  v_local_start := (p_start_at at time zone v_settings.timezone)::time;
  v_local_end := (p_end_at at time zone v_settings.timezone)::time;

  -- A block may never straddle local midnight.
  if v_local_date <> v_local_end_date then
    raise exception 'INVALID_SLOT';
  end if;

  -- Hard weekend rule, independent of rules, exceptions and demo data.
  if extract(isodow from v_local_date) > 5 then
    raise exception 'INVALID_SLOT';
  end if;

  -- Exactly one of the four fixed blocks. 12:00–13:00 is not in this list
  -- by construction, so lunch can never be reserved.
  if (v_local_start, v_local_end) not in (
    ('08:00'::time, '10:00'::time),
    ('10:00'::time, '12:00'::time),
    ('13:00'::time, '15:00'::time),
    ('15:00'::time, '17:00'::time)
  ) then
    raise exception 'INVALID_SLOT';
  end if;

  -- --- availability: everything below is SLOT_UNAVAILABLE ---

  if p_start_at < now() + (v_settings.minimum_notice_hours || ' hours')::interval then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  -- Same local-calendar-date horizon rule the slot generator uses, so the
  -- two can never disagree about the final bookable day.
  v_local_today := (now() at time zone v_settings.timezone)::date;
  v_local_horizon_end := v_local_today + v_settings.booking_horizon_days;
  if v_local_date > v_local_horizon_end then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if not exists (
    select 1 from public.resolve_availability_windows(v_coach_id, v_local_date) w
    where w.start_time <= v_local_start and w.end_time >= v_local_end
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if exists (
    select 1
    from public.sessions s
    join public.clients c on c.id = s.client_id
    join public.engagements e on e.id = c.engagement_id
    where e.coach_id = v_coach_id
      and s.date between v_local_date - 1 and v_local_date + 1
      and (s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone < p_end_at
      and ((s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone) + (s.duration_minutes || ' minutes')::interval > p_start_at
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if exists (
    select 1
    from public.session_booking_requests b
    join public.clients c on c.id = b.client_id
    join public.engagements e on e.id = c.engagement_id
    where e.coach_id = v_coach_id
      and b.status in ('pending', 'accepted')
      and b.date between v_local_date - 1 and v_local_date + 1
      and (b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone < p_end_at
      and ((b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone) + (b.duration_minutes || ' minutes')::interval > p_start_at
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if exists (
    select 1 from public.public_booking_requests pbr
    where pbr.coach_id = v_coach_id
      and pbr.status in ('pending', 'accepted')
      and pbr.requested_start_at < p_end_at
      and pbr.requested_end_at > p_start_at
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  begin
    insert into public.public_booking_requests (
      coach_id, name, email, phone, message, requested_start_at, requested_end_at, status
    ) values (
      v_coach_id, trim(p_name), trim(p_email), nullif(trim(coalesce(p_phone, '')), ''), nullif(trim(coalesce(p_message, '')), ''),
      p_start_at, p_end_at, 'pending'
    )
    returning id into v_request_id;
  exception when unique_violation then
    raise exception 'SLOT_UNAVAILABLE';
  end;

  return v_request_id;
end;
$$;

grant execute on function public.create_public_booking_request(text, text, text, text, text, timestamptz, timestamptz) to anon, authenticated;

-- ------------------------------------------------- 3. atomic exception replacement
--
-- A coach/date has exactly one effective exception state. Writing it goes
-- through this single RPC so "unavailable" and "custom" rows can never
-- coexist, and a partially-written custom set can never be observed.

create or replace function public.replace_coach_availability_exception(
  p_date date,
  p_type text,
  p_blocks jsonb default '[]'::jsonb
)
returns table (id uuid, date date, type text, start_time time, end_time time)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid := public.current_coach_id();
  v_block jsonb;
  v_distinct int;
begin
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_date is null then
    raise exception 'INVALID_DATE';
  end if;

  if p_type is null or p_type not in ('unavailable', 'custom') then
    raise exception 'INVALID_TYPE';
  end if;

  if p_type = 'custom' then
    -- A weekend can only ever be marked unavailable, never made bookable.
    if extract(isodow from p_date) > 5 then
      raise exception 'WEEKEND_NOT_BOOKABLE';
    end if;

    if p_blocks is null or jsonb_typeof(p_blocks) <> 'array' or jsonb_array_length(p_blocks) = 0 then
      raise exception 'INVALID_BLOCKS';
    end if;

    -- Compared as text, so malformed input raises INVALID_BLOCKS rather
    -- than an unhelpful cast error.
    for v_block in select * from jsonb_array_elements(p_blocks)
    loop
      if (v_block->>'startTime', v_block->>'endTime') not in (
        ('08:00', '10:00'),
        ('10:00', '12:00'),
        ('13:00', '15:00'),
        ('15:00', '17:00')
      ) then
        raise exception 'INVALID_BLOCKS';
      end if;
    end loop;

    select count(distinct b->>'startTime') into v_distinct from jsonb_array_elements(p_blocks) b;
    if v_distinct <> jsonb_array_length(p_blocks) then
      raise exception 'DUPLICATE_BLOCK';
    end if;
  end if;

  -- Replace the whole state for this coach/date inside this transaction.
  delete from public.coach_availability_exceptions e
  where e.coach_id = v_coach_id and e.date = p_date;

  if p_type = 'unavailable' then
    return query
      with ins as (
        insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
        values (v_coach_id, p_date, 'unavailable', null, null)
        returning coach_availability_exceptions.id,
                  coach_availability_exceptions.date,
                  coach_availability_exceptions.type,
                  coach_availability_exceptions.start_time,
                  coach_availability_exceptions.end_time
      )
      select ins.id, ins.date, ins.type, ins.start_time, ins.end_time from ins;
  else
    return query
      with ins as (
        insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
        select v_coach_id, p_date, 'custom', (b->>'startTime')::time, (b->>'endTime')::time
        from jsonb_array_elements(p_blocks) b
        returning coach_availability_exceptions.id,
                  coach_availability_exceptions.date,
                  coach_availability_exceptions.type,
                  coach_availability_exceptions.start_time,
                  coach_availability_exceptions.end_time
      )
      select ins.id, ins.date, ins.type, ins.start_time, ins.end_time from ins order by ins.start_time;
  end if;
end;
$$;

revoke execute on function public.replace_coach_availability_exception(date, text, jsonb) from public;
revoke execute on function public.replace_coach_availability_exception(date, text, jsonb) from anon;
grant execute on function public.replace_coach_availability_exception(date, text, jsonb) to authenticated;

-- ------------------------------------------------- 4. public booking lifecycle
--
-- pending -> accept  -> accepted
-- pending -> decline -> declined
-- accepted -> cancel -> cancelled
--
-- Cancelling releases the slot, because slot generation and reservation
-- only treat 'pending' and 'accepted' as blocking. History is preserved —
-- rows are never deleted, and no client/user/engagement/session is created.

create or replace function public.respond_public_booking_request(p_request_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_status text;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_action not in ('accept', 'decline', 'cancel') then
    raise exception 'Invalid action';
  end if;

  select status into v_status
  from public.public_booking_requests
  where id = p_request_id and coach_id = v_coach_id
  for update;

  if v_status is null then
    raise exception 'Request not found or unauthorized';
  end if;

  if p_action in ('accept', 'decline') then
    if v_status <> 'pending' then
      raise exception 'Request already responded to';
    end if;
  else
    if v_status <> 'accepted' then
      raise exception 'Only accepted reservations can be cancelled';
    end if;
  end if;

  update public.public_booking_requests
  set status = case p_action
                 when 'accept' then 'accepted'
                 when 'decline' then 'declined'
                 else 'cancelled'
               end,
      responded_at = now()
  where id = p_request_id;
end;
$$;

-- ------------------------------------------------- 5. internal accept conflict check
--
-- Internal meetings keep their flexible times and may fall on weekends —
-- they are NOT constrained to the four public blocks. What changes is that
-- accepting one now rejects any overlap across the coach's whole calendar:
-- existing sessions, other live internal requests, and live public
-- reservations. The lock/authorize/check/create/accept sequence stays in
-- one transaction, so the check cannot be raced.

create or replace function public.accept_session_booking(p_booking_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid := public.current_coach_id();
  v_client_id uuid := public.current_client_id();
  v_booking public.session_booking_requests;
  v_owner_coach_id uuid;
  v_tz text;
  v_start timestamptz;
  v_end timestamptz;
  v_next_number int;
  v_session_id uuid;
begin
  select * into v_booking from public.session_booking_requests where id = p_booking_id for update;
  if not found then
    raise exception 'booking not found';
  end if;
  if v_booking.status <> 'pending' then
    raise exception 'booking is not pending';
  end if;

  if v_booking.requested_by_role = 'klient' then
    if v_coach_id is null or not public.client_owned_by_current_coach(v_booking.client_id) then
      raise exception 'not authorized to accept this booking';
    end if;
  else
    if v_client_id is null or v_client_id <> v_booking.client_id then
      raise exception 'not authorized to accept this booking';
    end if;
  end if;

  -- Owning coach is derived from the booking's client, never from the
  -- caller — a client accepting a coach proposal must be checked against
  -- that coach's calendar, not their own identity.
  select e.coach_id into v_owner_coach_id
  from public.clients c
  join public.engagements e on e.id = c.engagement_id
  where c.id = v_booking.client_id;

  if v_owner_coach_id is null then
    raise exception 'booking has no owning coach';
  end if;

  select cbs.timezone into v_tz
  from public.coach_booking_settings cbs
  where cbs.coach_id = v_owner_coach_id;
  if v_tz is null then
    v_tz := 'Europe/Stockholm';
  end if;

  v_start := (v_booking.date::text || ' ' || v_booking.time)::timestamp at time zone v_tz;
  v_end := v_start + (v_booking.duration_minutes || ' minutes')::interval;

  -- A) existing sessions for this coach
  if exists (
    select 1
    from public.sessions s
    join public.clients c on c.id = s.client_id
    join public.engagements e on e.id = c.engagement_id
    where e.coach_id = v_owner_coach_id
      and s.date between v_booking.date - 1 and v_booking.date + 1
      and (s.date::text || ' ' || s.time)::timestamp at time zone v_tz < v_end
      and ((s.date::text || ' ' || s.time)::timestamp at time zone v_tz) + (s.duration_minutes || ' minutes')::interval > v_start
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  -- B) other live internal booking requests for this coach
  if exists (
    select 1
    from public.session_booking_requests b
    join public.clients c on c.id = b.client_id
    join public.engagements e on e.id = c.engagement_id
    where e.coach_id = v_owner_coach_id
      and b.id <> p_booking_id
      and b.status in ('pending', 'accepted')
      and b.date between v_booking.date - 1 and v_booking.date + 1
      and (b.date::text || ' ' || b.time)::timestamp at time zone v_tz < v_end
      and ((b.date::text || ' ' || b.time)::timestamp at time zone v_tz) + (b.duration_minutes || ' minutes')::interval > v_start
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  -- C) live public reservations for this coach
  if exists (
    select 1
    from public.public_booking_requests pbr
    where pbr.coach_id = v_owner_coach_id
      and pbr.status in ('pending', 'accepted')
      and pbr.requested_start_at < v_end
      and pbr.requested_end_at > v_start
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  select coalesce(max(number), 0) + 1 into v_next_number
  from public.sessions where client_id = v_booking.client_id;

  insert into public.sessions (client_id, number, date, time, duration_minutes, status, location)
  values (v_booking.client_id, v_next_number, v_booking.date, v_booking.time, v_booking.duration_minutes, 'kommande', v_booking.location)
  returning id into v_session_id;

  update public.session_booking_requests
  set status = 'accepted', session_id = v_session_id, responded_at = now()
  where id = p_booking_id;

  return v_session_id;
end;
$$;
