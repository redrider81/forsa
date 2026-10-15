-- CVB Base — public introductory calls become individually bookable
-- 30-minute slots.
--
-- Carolina's availability administration is unchanged: she still turns the
-- four fixed weekday blocks (08–10, 10–12, 13–15, 15–17) on and off per
-- weekday, and per date through exceptions. What changes is what one public
-- booking reserves: an available block is now offered as four separate
-- half-hours (e.g. 10:00–10:30, 10:30–11:00, 11:00–11:30, 11:30–12:00), and a
-- reservation holds only its own 30 minutes.
--
-- Unchanged: Monday–Friday only, 12:00–13:00 always lunch, minimum notice,
-- booking horizon, the pending/accepted blocking set, the conflict checks
-- against sessions, internal booking requests and other public requests,
-- the in-transaction notification outbox, and every other function.
--
-- Existing requests are not touched. A legacy two-hour request still blocks
-- every half-hour it overlaps, through the same interval-overlap checks.
--
-- Concurrency: every new public request is exactly 30 minutes on the same
-- half-hour grid, so two new requests overlap only if they start at the
-- same instant — which public_booking_requests_active_slot_idx already
-- refuses for pending/accepted rows. A losing concurrent insert fails there
-- and is reported as SLOT_UNAVAILABLE.
--
-- Both functions keep their signatures and return types, so existing grants
-- are retained and no caller changes.

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
  v_slot_start time;
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
        -- A block is offered only when Carolina's availability covers the
        -- whole block, exactly as before; it is then split into half-hours.
        if exists (
          select 1 from public.resolve_availability_windows(v_coach_id, v_d) w
          where w.start_time <= v_block.block_start and w.end_time >= v_block.block_end
        ) then
          v_slot_start := v_block.block_start;
          while v_slot_start < v_block.block_end loop
            v_candidate_start := (v_d::text || ' ' || v_slot_start::text)::timestamp at time zone v_settings.timezone;
            v_candidate_end := v_candidate_start + interval '30 minutes';

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

            v_slot_start := v_slot_start + interval '30 minutes';
          end loop;
        end if;
      end loop;
    end if;
    v_d := v_d + 1;
  end loop;
end;
$$;

grant execute on function public.get_public_booking_slots(text, date, date) to anon, authenticated;

-- ---------------------------------------------------------------- public reservation
--
-- Identical to 20260908090000 except for the slot shape: exactly 30 minutes,
-- starting on the hour or half-hour, inside one of the four fixed blocks.
-- The containing block must be available in full — the same rule the slot
-- generator applies — so the two can never disagree.
--
-- The exact-30-minute check is safe despite DST: Europe/Stockholm
-- transitions happen at 03:00 on a Sunday, and public booking is
-- Monday–Friday 08–17 only.

create or replace function public.create_public_booking_request(
  p_slug text,
  p_name text,
  p_email text,
  p_phone text,
  p_message text,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_locale text default 'sv'
)
returns table (request_id uuid, dispatch_token uuid)
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
  v_block_start time;
  v_block_end time;
  v_local_today date;
  v_local_horizon_end date;
  v_request_id uuid;
  v_token uuid;
  v_locale text;
  v_email text;
begin
  select cbs.* into v_settings from public.coach_booking_settings cbs where cbs.public_slug = p_slug;
  if v_settings.coach_id is null or not v_settings.public_booking_enabled then
    raise exception 'BOOKING_DISABLED';
  end if;
  v_coach_id := v_settings.coach_id;

  if p_name is null or trim(p_name) = '' or p_email is null or trim(p_email) = '' then
    raise exception 'INVALID_REQUEST';
  end if;

  v_locale := case when p_locale = 'en' then 'en' else 'sv' end;

  -- --- shape: everything below is INVALID_SLOT, never SLOT_UNAVAILABLE ---

  if p_start_at is null or p_end_at is null then
    raise exception 'INVALID_SLOT';
  end if;

  if p_end_at <= p_start_at then
    raise exception 'INVALID_SLOT';
  end if;

  if p_end_at - p_start_at <> interval '30 minutes' then
    raise exception 'INVALID_SLOT';
  end if;

  v_local_date := (p_start_at at time zone v_settings.timezone)::date;
  v_local_end_date := (p_end_at at time zone v_settings.timezone)::date;
  v_local_start := (p_start_at at time zone v_settings.timezone)::time;
  v_local_end := (p_end_at at time zone v_settings.timezone)::time;

  -- A slot may never straddle local midnight.
  if v_local_date <> v_local_end_date then
    raise exception 'INVALID_SLOT';
  end if;

  -- Hard weekend rule, independent of rules, exceptions and demo data.
  if extract(isodow from v_local_date) > 5 then
    raise exception 'INVALID_SLOT';
  end if;

  -- Must be one of the four half-hours of one of the four fixed blocks.
  -- 12:00–13:00 lies in no block, so lunch can never be reserved.
  select b.block_start, b.block_end into v_block_start, v_block_end
  from (values
    ('08:00'::time, '10:00'::time),
    ('10:00'::time, '12:00'::time),
    ('13:00'::time, '15:00'::time),
    ('15:00'::time, '17:00'::time)
  ) as b(block_start, block_end)
  where b.block_start <= v_local_start
    and v_local_end <= b.block_end
    and v_local_start in (
      b.block_start,
      b.block_start + interval '30 minutes',
      b.block_start + interval '60 minutes',
      b.block_start + interval '90 minutes'
    );

  if v_block_start is null then
    raise exception 'INVALID_SLOT';
  end if;

  -- --- availability: everything below is SLOT_UNAVAILABLE ---

  if p_start_at < now() + (v_settings.minimum_notice_hours || ' hours')::interval then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  v_local_today := (now() at time zone v_settings.timezone)::date;
  v_local_horizon_end := v_local_today + v_settings.booking_horizon_days;
  if v_local_date > v_local_horizon_end then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if not exists (
    select 1 from public.resolve_availability_windows(v_coach_id, v_local_date) w
    where w.start_time <= v_block_start and w.end_time >= v_block_end
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

  v_email := trim(p_email);

  begin
    insert into public.public_booking_requests (
      coach_id, name, email, phone, message, requested_start_at, requested_end_at, status, locale
    ) values (
      v_coach_id, trim(p_name), v_email, nullif(trim(coalesce(p_phone, '')), ''), nullif(trim(coalesce(p_message, '')), ''),
      p_start_at, p_end_at, 'pending', v_locale
    )
    returning id, public_booking_requests.dispatch_token into v_request_id, v_token;
  exception when unique_violation then
    raise exception 'SLOT_UNAVAILABLE';
  end;

  -- Same transaction as the reservation above: either the request and both
  -- outbox rows exist, or none of them do.
  perform public.queue_public_booking_notification(v_request_id, 'customer_request_received', 'customer', v_email);
  perform public.queue_public_booking_notification(v_request_id, 'coach_new_request', 'coach', null);

  request_id := v_request_id;
  dispatch_token := v_token;
  return next;
end;
$$;

grant execute on function public.create_public_booking_request(text, text, text, text, text, timestamptz, timestamptz, text) to anon, authenticated;
