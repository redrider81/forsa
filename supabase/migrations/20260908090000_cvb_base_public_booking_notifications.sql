-- CVB Base — durable notification ledger for the public booking chain.
--
-- Scope: the public first-contact chain only.
--
--   visitor -> pending public booking request -> Carolina accepts or declines
--
-- Nothing here creates a client, auth user, profile, engagement, coaching
-- agreement, development goal, session, or CVB Base access. An accepted
-- introductory-call request is NOT an accepted coaching client.
--
-- The booking model itself stays frozen: Monday–Friday only, exactly four
-- fixed two-hour availability windows (08–10, 10–12, 13–15, 15–17), and
-- only 'pending'/'accepted' block a window. None of that changes below.
--
-- What is added is an outbox: every notification-producing booking event
-- writes its notification row inside the SAME transaction as the booking
-- mutation, so a row can never be lost and an email attempt can never roll
-- back a valid booking. Sending happens strictly after commit.

-- ------------------------------------------------- 1. request-level additions
--
-- locale         — which language the visitor used, so the later accept and
--                  decline emails can be written in the same language.
-- dispatch_token — a secret handed back only to the server request that
--                  created the row. It authorises that server request to
--                  record its own post-commit send results without a coach
--                  session, and without granting anonymous callers any way
--                  to touch some other visitor's notifications.

alter table public.public_booking_requests
  add column if not exists locale text not null default 'sv',
  add column if not exists dispatch_token uuid not null default gen_random_uuid();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'public_booking_requests_locale_check'
  ) then
    alter table public.public_booking_requests
      add constraint public_booking_requests_locale_check check (locale in ('sv', 'en'));
  end if;
end;
$$;

-- ------------------------------------------------- 2. notification ledger
--
-- One row per logical notification event. Deliberately booking-specific:
-- this is an outbox for four known events, not a general messaging system.
--
-- recipient_email is a snapshot for audit only — it is never the address a
-- send is routed to. Customer rows carry the address the visitor submitted.
-- Coach rows are created with null and are filled in by the server from its
-- own server-only configuration when the first attempt is recorded, so an
-- anonymous caller can never nominate an operator recipient.
--
-- status meaning:
--   pending — created, not yet attempted
--   sending — an attempt is in flight
--   sent    — the email provider ACCEPTED the send request. It does NOT
--             mean the message reached an inbox, was opened, or did not
--             later bounce. No delivery webhook exists in this pass.
--   failed  — the provider rejected the attempt; safe to retry

create table if not exists public.public_booking_notifications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.public_booking_requests(id) on delete cascade,
  event_type text not null check (event_type in (
    'customer_request_received',
    'coach_new_request',
    'customer_request_accepted',
    'customer_request_declined'
  )),
  recipient_type text not null check (recipient_type in ('customer', 'coach')),
  recipient_email text,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempt_count integer not null default 0,
  last_attempt_at timestamptz,
  provider_message_id text,
  provider_accepted_at timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Exactly one default logical event per request + event type. This is the
  -- durable guard against accidentally queueing the same notification twice.
  constraint public_booking_notifications_request_event_key unique (request_id, event_type)
);

create index if not exists public_booking_notifications_status_idx
  on public.public_booking_notifications (status, created_at);

-- ------------------------------------------------- 3. RLS
--
-- Carolina may READ her own booking notifications. No insert/update/delete
-- policy exists for any role, so the ledger can only ever be written by the
-- SECURITY DEFINER functions below. No anon policy exists at all, so
-- anonymous SELECT is denied by default.

alter table public.public_booking_notifications enable row level security;

drop policy if exists public_booking_notifications_select_coach on public.public_booking_notifications;
create policy public_booking_notifications_select_coach on public.public_booking_notifications
  for select to authenticated
  using (
    exists (
      select 1 from public.public_booking_requests r
      where r.id = public_booking_notifications.request_id
        and r.coach_id = public.current_coach_id()
    )
  );

-- New entities are not auto-exposed through the Data API (see
-- supabase/config.toml: auto_expose_new_tables), so the RLS policy above
-- needs its base privilege. Read-only, and still filtered by the policy.
grant select on table public.public_booking_notifications to authenticated;

-- public_booking_requests has carried an RLS select policy for the coach
-- since it was created but never the matching base grant, so the coach's
-- own pending website requests could not actually be read back. Same
-- read-only, policy-filtered privilege.
grant select on table public.public_booking_requests to authenticated;

-- ------------------------------------------------- 4. outbox helper
--
-- Deterministic idempotency key: the same logical event always produces the
-- same key, so a retry reuses it both locally and at the email provider.

create or replace function public.queue_public_booking_notification(
  p_request_id uuid,
  p_event_type text,
  p_recipient_type text,
  p_recipient_email text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.public_booking_notifications (
    request_id, event_type, recipient_type, recipient_email, idempotency_key
  )
  values (
    p_request_id,
    p_event_type,
    p_recipient_type,
    p_recipient_email,
    'cvb-public-booking/' || p_request_id::text || '/' || p_event_type
  )
  on conflict (request_id, event_type) do nothing;
$$;

revoke execute on function public.queue_public_booking_notification(uuid, text, text, text) from public, anon, authenticated;

-- ------------------------------------------------- 5. public reservation
--
-- Identical validation to the previous definition — the frozen booking
-- rules are reproduced verbatim. Two things are added: the visitor's locale
-- is persisted, and the two submission notifications are written inside
-- this same transaction, so request + outbox rows commit together.
--
-- The return type gains the dispatch token, so the creating server request
-- can record its own send results afterwards. Return type changes require a
-- drop; the old signature has exactly one caller (the public booking route).

drop function if exists public.create_public_booking_request(text, text, text, text, text, timestamptz, timestamptz);

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

  -- Exactly one of the four fixed availability windows. 12:00–13:00 is not
  -- in this list by construction, so lunch can never be reserved.
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

-- ------------------------------------------------- 6. accept / decline / cancel
--
-- Unchanged lifecycle and unchanged slot semantics:
--
--   pending  -> accept  -> accepted   (window stays blocked)
--   pending  -> decline -> declined   (window is released — 'declined' is
--                                      not in the blocking set used by
--                                      get_public_booking_slots and
--                                      create_public_booking_request)
--   accepted -> cancel  -> cancelled  (window is released)
--
-- What is added: accept and decline write their notification row inside the
-- same transaction as the status change. Cancel produces no customer email
-- in this pass and therefore queues nothing.

create or replace function public.respond_public_booking_request(p_request_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_status text;
  v_email text;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_action not in ('accept', 'decline', 'cancel') then
    raise exception 'Invalid action';
  end if;

  select status, email into v_status, v_email
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

  if p_action = 'accept' then
    perform public.queue_public_booking_notification(p_request_id, 'customer_request_accepted', 'customer', v_email);
  elsif p_action = 'decline' then
    perform public.queue_public_booking_notification(p_request_id, 'customer_request_declined', 'customer', v_email);
  end if;
end;
$$;

grant execute on function public.respond_public_booking_request(uuid, text) to authenticated;
revoke execute on function public.respond_public_booking_request(uuid, text) from anon, public;

-- ------------------------------------------------- 7. recording send results
--
-- Called only after the booking transaction has committed. It records the
-- outcome of one attempt and can never create or transition a booking.
--
-- Authorisation is one of:
--   * the owning coach (accept/decline/retry paths), or
--   * the exact dispatch token returned to the server request that created
--     this booking (public submission path).
--
-- Without one of those an anonymous caller cannot mark, retry, redirect or
-- even observe any notification. The function returns void, so it leaks
-- nothing back to its caller either.
--
-- A row already recorded as 'sent' is immutable here: an ordinary retry can
-- never intentionally re-send a successful notification.

create or replace function public.record_public_booking_notification_result(
  p_request_id uuid,
  p_event_type text,
  p_status text,
  p_dispatch_token uuid default null,
  p_recipient_email text default null,
  p_provider_message_id text default null,
  p_error_code text default null,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.public_booking_requests%rowtype;
  v_current text;
begin
  if p_status not in ('sending', 'sent', 'failed') then
    raise exception 'INVALID_NOTIFICATION_STATUS';
  end if;

  select * into v_request from public.public_booking_requests where id = p_request_id;
  if v_request.id is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  -- Both sides are coalesced. current_coach_id() is null for an anonymous
  -- caller, and `coach_id = null` evaluates to NULL rather than false, so
  -- without this an unauthenticated caller with a wrong token would fall
  -- straight through `if not (...)` instead of being refused.
  if not (
    coalesce(v_request.coach_id = public.current_coach_id(), false)
    or coalesce(p_dispatch_token = v_request.dispatch_token, false)
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select status into v_current
  from public.public_booking_notifications
  where request_id = p_request_id and event_type = p_event_type
  for update;

  if v_current is null then
    raise exception 'NOTIFICATION_NOT_FOUND';
  end if;

  -- Success is terminal. Nothing reopens it.
  if v_current = 'sent' then
    return;
  end if;

  update public.public_booking_notifications
  set status = p_status,
      -- Only a real attempt increments the counter.
      attempt_count = case when p_status = 'sending' then attempt_count + 1 else attempt_count end,
      last_attempt_at = case when p_status = 'sending' then now() else last_attempt_at end,
      recipient_email = coalesce(recipient_email, nullif(trim(coalesce(p_recipient_email, '')), '')),
      provider_message_id = case when p_status = 'sent' then p_provider_message_id else provider_message_id end,
      provider_accepted_at = case when p_status = 'sent' then now() else provider_accepted_at end,
      last_error_code = case when p_status = 'failed' then left(coalesce(p_error_code, 'provider_error'), 80) else null end,
      last_error_message = case when p_status = 'failed' then left(coalesce(p_error_message, ''), 300) else null end,
      updated_at = now()
  where request_id = p_request_id and event_type = p_event_type;
end;
$$;

grant execute on function public.record_public_booking_notification_result(uuid, text, text, uuid, text, text, text, text) to anon, authenticated;
