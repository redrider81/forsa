-- CVB Base — public booking moves from dynamic duration/buffer-based slot
-- generation to exactly four fixed weekday blocks, with a permanent lunch
-- gap and a hard Monday–Friday rule enforced server-side, independent of
-- weekly availability, date exceptions, or demo data. Coach-authenticated
-- flows (sessions, meeting_duration_minutes, buffer_minutes) are untouched;
-- only the two public-facing functions change. No schema change is
-- required — the fixed blocks are represented using the existing
-- coach_availability_rules / coach_availability_exceptions interval
-- storage, just constrained to four specific values going forward.

-- ---------------------------------------------------------------- public slots

create or replace function public.get_public_booking_slots(p_slug text, p_start_date date, p_end_date date)
returns table (date date, start_at timestamptz, end_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_settings public.coach_booking_settings%rowtype;
  v_today date;
  v_horizon_end date;
  v_min_start timestamptz;
  v_d date;
  v_block record;
  v_candidate_start timestamptz;
  v_candidate_end timestamptz;
begin
  select cbs.* into v_settings from public.coach_booking_settings cbs where cbs.public_slug = p_slug;
  if v_settings.coach_id is null or not v_settings.public_booking_enabled then
    return;
  end if;
  v_coach_id := v_settings.coach_id;

  v_today := (now() at time zone v_settings.timezone)::date;
  v_horizon_end := v_today + v_settings.booking_horizon_days;
  v_min_start := now() + (v_settings.minimum_notice_hours || ' hours')::interval;

  v_d := greatest(p_start_date, v_today);
  if p_end_date < v_horizon_end then
    v_horizon_end := p_end_date;
  end if;

  while v_d <= v_horizon_end loop
    -- Hard weekend rule: Saturday/Sunday are never publicly bookable,
    -- regardless of weekly availability, date exceptions, or demo data.
    if extract(isodow from v_d) <= 5 then
      for v_block in
        select * from (values
          (1, '08:00'::time, '10:00'::time),
          (2, '10:00'::time, '12:00'::time),
          (3, '13:00'::time, '15:00'::time),
          (4, '15:00'::time, '17:00'::time)
        ) as b(idx, block_start, block_end)
      loop
        if exists (
          select 1 from public.resolve_availability_windows(v_coach_id, v_d) w
          where w.start_time <= v_block.block_start and w.end_time >= v_block.block_end
        ) then
          v_candidate_start := (v_d::text || ' ' || v_block.block_start::text)::timestamp at time zone v_settings.timezone;
          v_candidate_end := (v_d::text || ' ' || v_block.block_end::text)::timestamp at time zone v_settings.timezone;

          if v_candidate_start >= v_min_start and not exists (
            select 1
            from public.sessions s
            join public.clients c on c.id = s.client_id
            join public.engagements e on e.id = c.engagement_id
            where e.coach_id = v_coach_id
              and s.date between v_d - 1 and v_d + 1
              and (s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone < v_candidate_end
              and ((s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone) + (s.duration_minutes || ' minutes')::interval > v_candidate_start
          ) and not exists (
            select 1
            from public.session_booking_requests b
            join public.clients c on c.id = b.client_id
            join public.engagements e on e.id = c.engagement_id
            where e.coach_id = v_coach_id
              and b.status in ('pending', 'accepted')
              and b.date between v_d - 1 and v_d + 1
              and (b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone < v_candidate_end
              and ((b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone) + (b.duration_minutes || ' minutes')::interval > v_candidate_start
          ) and not exists (
            select 1
            from public.public_booking_requests pbr
            where pbr.coach_id = v_coach_id
              and pbr.status in ('pending', 'accepted')
              and pbr.requested_start_at < v_candidate_end
              and pbr.requested_end_at > v_candidate_start
          ) then
            date := v_d;
            start_at := v_candidate_start;
            end_at := v_candidate_end;
            return next;
          end if;
        end if;
      end loop;
    end if;
    v_d := v_d + 1;
  end loop;
end;
$$;

grant execute on function public.get_public_booking_slots(text, date, date) to anon, authenticated;

-- ---------------------------------------------------------------- public reservation

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
  v_local_start time;
  v_local_end time;
  v_min_start timestamptz;
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

  v_local_date := (p_start_at at time zone v_settings.timezone)::date;
  v_local_start := (p_start_at at time zone v_settings.timezone)::time;
  v_local_end := (p_end_at at time zone v_settings.timezone)::time;

  -- Hard weekend rule, independent of everything else.
  if extract(isodow from v_local_date) > 5 then
    raise exception 'INVALID_SLOT';
  end if;

  -- Must be exactly one of the four fixed public blocks — never an
  -- arbitrary interval, and never the 12:00–13:00 lunch gap (which is not
  -- one of the four values below by construction).
  if (v_local_start, v_local_end) not in (
    ('08:00'::time, '10:00'::time),
    ('10:00'::time, '12:00'::time),
    ('13:00'::time, '15:00'::time),
    ('15:00'::time, '17:00'::time)
  ) then
    raise exception 'INVALID_SLOT';
  end if;

  v_min_start := now() + (v_settings.minimum_notice_hours || ' hours')::interval;
  if p_start_at < v_min_start then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if p_start_at > now() + (v_settings.booking_horizon_days || ' days')::interval then
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
