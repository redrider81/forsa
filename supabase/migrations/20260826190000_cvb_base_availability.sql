-- CVB Base — Tillgänglighet + public booking V1.
-- CVB Base is the source of truth: Carolina's weekly availability, date
-- exceptions, and booking settings, combined with existing sessions and
-- existing client booking requests, determine real bookable slots. The
-- public website reads ONLY generated slots and submits ONLY a pending
-- prospect request — never internal calendar data. All times are computed
-- in Europe/Stockholm via `AT TIME ZONE`, which is DST-correct because it
-- resolves the offset for the specific date given, not a fixed offset.

-- ---------------------------------------------------------------- tables

create table public.coach_availability_rules (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index coach_availability_rules_coach_weekday_idx
  on public.coach_availability_rules (coach_id, weekday);

create table public.coach_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  date date not null,
  type text not null check (type in ('unavailable', 'custom')),
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  check (
    (type = 'unavailable' and start_time is null and end_time is null)
    or (type = 'custom' and start_time is not null and end_time is not null and start_time < end_time)
  )
);

create index coach_availability_exceptions_coach_date_idx
  on public.coach_availability_exceptions (coach_id, date);

create table public.coach_booking_settings (
  coach_id uuid primary key references public.coaches(id) on delete cascade,
  meeting_duration_minutes int not null default 60 check (meeting_duration_minutes in (30, 45, 60, 90)),
  buffer_minutes int not null default 15 check (buffer_minutes in (0, 15, 30, 45, 60)),
  minimum_notice_hours int not null default 24 check (minimum_notice_hours in (2, 6, 12, 24, 48)),
  booking_horizon_days int not null default 30 check (booking_horizon_days in (14, 30, 60, 90)),
  timezone text not null default 'Europe/Stockholm',
  public_booking_enabled boolean not null default false,
  public_slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.public_booking_requests (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text,
  requested_start_at timestamptz not null,
  requested_end_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requested_start_at < requested_end_at)
);

create index public_booking_requests_coach_status_idx
  on public.public_booking_requests (coach_id, status);
create index public_booking_requests_start_idx
  on public.public_booking_requests (requested_start_at);

-- Hard concurrency backstop: only one active (pending/accepted) request may
-- hold a given coach+start time. A losing concurrent insert fails here even
-- if the RPC's own pre-check raced.
create unique index public_booking_requests_active_slot_idx
  on public.public_booking_requests (coach_id, requested_start_at)
  where status in ('pending', 'accepted');

-- ---------------------------------------------------------------- RLS

alter table public.coach_availability_rules enable row level security;
alter table public.coach_availability_exceptions enable row level security;
alter table public.coach_booking_settings enable row level security;
alter table public.public_booking_requests enable row level security;

-- Coach manages only their own rows. No policy exists for `anon` on any of
-- these four tables, so anonymous SELECT is denied by default — the public
-- website can only reach this data through the two SECURITY DEFINER
-- functions below.

create policy availability_rules_coach on public.coach_availability_rules
  for all to authenticated
  using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

create policy availability_exceptions_coach on public.coach_availability_exceptions
  for all to authenticated
  using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

create policy booking_settings_coach on public.coach_booking_settings
  for all to authenticated
  using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

-- Coach may only READ public requests directly. Status transitions happen
-- exclusively through respond_public_booking_request() below — no update
-- policy exists, so the browser cannot mutate status arbitrarily.
create policy public_booking_requests_select_coach on public.public_booking_requests
  for select to authenticated
  using (coach_id = public.current_coach_id());

-- ---------------------------------------------------------------- default settings

-- Safe default row for the existing coach: public booking stays paused
-- until Carolina explicitly turns it on. No weekly hours are invented.
insert into public.coach_booking_settings (coach_id, public_slug, public_booking_enabled)
select id, 'carolina-von-braun', false
from public.coaches
where not exists (select 1 from public.coach_booking_settings where coach_id = public.coaches.id);

-- ---------------------------------------------------------------- slot helpers

-- Shared availability-window resolver: for one coach+date, returns the
-- effective interval(s) after date exceptions override the weekday rule.
-- Not exposed publicly — used internally by both RPCs below.
create or replace function public.resolve_availability_windows(p_coach_id uuid, p_date date)
returns table (start_time time, end_time time)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = p_coach_id and date = p_date and type = 'unavailable'
  ) then
    return;
  end if;

  if exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = p_coach_id and date = p_date and type = 'custom'
  ) then
    return query
      select e.start_time, e.end_time
      from public.coach_availability_exceptions e
      where e.coach_id = p_coach_id and e.date = p_date and e.type = 'custom';
    return;
  end if;

  return query
    select r.start_time, r.end_time
    from public.coach_availability_rules r
    where r.coach_id = p_coach_id and r.weekday = extract(isodow from p_date)::smallint;
end;
$$;

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
  v_window record;
  v_slot_start time;
  v_candidate_start timestamptz;
  v_candidate_end timestamptz;
  v_step interval;
begin
  select cbs.* into v_settings from public.coach_booking_settings cbs where cbs.public_slug = p_slug;
  if v_settings.coach_id is null or not v_settings.public_booking_enabled then
    return;
  end if;
  v_coach_id := v_settings.coach_id;

  v_today := (now() at time zone v_settings.timezone)::date;
  v_horizon_end := v_today + v_settings.booking_horizon_days;
  v_min_start := now() + (v_settings.minimum_notice_hours || ' hours')::interval;
  v_step := (v_settings.meeting_duration_minutes + v_settings.buffer_minutes) * interval '1 minute';

  v_d := greatest(p_start_date, v_today);
  if p_end_date < v_horizon_end then
    v_horizon_end := p_end_date;
  end if;

  while v_d <= v_horizon_end loop
    for v_window in select * from public.resolve_availability_windows(v_coach_id, v_d) loop
      v_slot_start := v_window.start_time;
      while v_slot_start + (v_settings.meeting_duration_minutes || ' minutes')::interval <= v_window.end_time loop
        v_candidate_start := (v_d::text || ' ' || v_slot_start::text)::timestamp at time zone v_settings.timezone;
        v_candidate_end := v_candidate_start + (v_settings.meeting_duration_minutes || ' minutes')::interval;

        if v_candidate_start >= v_min_start and not exists (
          -- existing sessions for this coach's clients
          select 1
          from public.sessions s
          join public.clients c on c.id = s.client_id
          join public.engagements e on e.id = c.engagement_id
          where e.coach_id = v_coach_id
            and s.date between v_d - 1 and v_d + 1
            and (s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone < v_candidate_end + (v_settings.buffer_minutes || ' minutes')::interval
            and ((s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone) + (s.duration_minutes || ' minutes')::interval > v_candidate_start - (v_settings.buffer_minutes || ' minutes')::interval
        ) and not exists (
          -- existing authenticated client booking requests, still pending/accepted
          select 1
          from public.session_booking_requests b
          join public.clients c on c.id = b.client_id
          join public.engagements e on e.id = c.engagement_id
          where e.coach_id = v_coach_id
            and b.status in ('pending', 'accepted')
            and b.date between v_d - 1 and v_d + 1
            and (b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone < v_candidate_end + (v_settings.buffer_minutes || ' minutes')::interval
            and ((b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone) + (b.duration_minutes || ' minutes')::interval > v_candidate_start - (v_settings.buffer_minutes || ' minutes')::interval
        ) and not exists (
          -- other public booking requests, still pending/accepted
          select 1
          from public.public_booking_requests pbr
          where pbr.coach_id = v_coach_id
            and pbr.status in ('pending', 'accepted')
            and pbr.requested_start_at < v_candidate_end + (v_settings.buffer_minutes || ' minutes')::interval
            and pbr.requested_end_at > v_candidate_start - (v_settings.buffer_minutes || ' minutes')::interval
        ) then
          date := v_d;
          start_at := v_candidate_start;
          end_at := v_candidate_end;
          return next;
        end if;

        v_slot_start := v_slot_start + v_step;
      end loop;
    end loop;
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

  if p_end_at - p_start_at <> (v_settings.meeting_duration_minutes || ' minutes')::interval then
    raise exception 'INVALID_SLOT';
  end if;

  v_min_start := now() + (v_settings.minimum_notice_hours || ' hours')::interval;
  if p_start_at < v_min_start then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if p_start_at > now() + (v_settings.booking_horizon_days || ' days')::interval then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  v_local_date := (p_start_at at time zone v_settings.timezone)::date;
  v_local_start := (p_start_at at time zone v_settings.timezone)::time;
  v_local_end := (p_end_at at time zone v_settings.timezone)::time;

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
      and (s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone < p_end_at + (v_settings.buffer_minutes || ' minutes')::interval
      and ((s.date::text || ' ' || s.time)::timestamp at time zone v_settings.timezone) + (s.duration_minutes || ' minutes')::interval > p_start_at - (v_settings.buffer_minutes || ' minutes')::interval
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
      and (b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone < p_end_at + (v_settings.buffer_minutes || ' minutes')::interval
      and ((b.date::text || ' ' || b.time)::timestamp at time zone v_settings.timezone) + (b.duration_minutes || ' minutes')::interval > p_start_at - (v_settings.buffer_minutes || ' minutes')::interval
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  if exists (
    select 1 from public.public_booking_requests pbr
    where pbr.coach_id = v_coach_id
      and pbr.status in ('pending', 'accepted')
      and pbr.requested_start_at < p_end_at + (v_settings.buffer_minutes || ' minutes')::interval
      and pbr.requested_end_at > p_start_at - (v_settings.buffer_minutes || ' minutes')::interval
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

-- ---------------------------------------------------------------- coach response

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

  if p_action not in ('accept', 'decline') then
    raise exception 'Invalid action';
  end if;

  select status into v_status from public.public_booking_requests where id = p_request_id and coach_id = v_coach_id for update;
  if v_status is null then
    raise exception 'Request not found or unauthorized';
  end if;
  if v_status <> 'pending' then
    raise exception 'Request already responded to';
  end if;

  update public.public_booking_requests
  set status = case when p_action = 'accept' then 'accepted' else 'declined' end,
      responded_at = now()
  where id = p_request_id;
end;
$$;

grant execute on function public.respond_public_booking_request(uuid, text) to authenticated;
revoke execute on function public.respond_public_booking_request(uuid, text) from anon, public;
