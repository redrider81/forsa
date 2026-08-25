-- CVB Base — coach/client meeting booking. One new table so either party
-- can propose a coaching meeting time; the other party accepts or declines.
-- Acceptance atomically creates the real `sessions` row (existing date/time
-- convention: date + free-text time, session_status 'kommande'); nothing
-- about session numbering or the sessions table itself changes.

create type public.booking_role as enum ('coach', 'klient');
create type public.booking_status as enum ('pending', 'accepted', 'declined', 'cancelled');

create table public.session_booking_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  requested_by_role public.booking_role not null,
  date date not null,
  time text not null default '',
  duration_minutes int not null default 60,
  location text not null default '',
  message text,
  status public.booking_status not null default 'pending',
  session_id uuid references public.sessions (id) on delete set null,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index session_booking_requests_client_id_idx on public.session_booking_requests (client_id);

alter table public.session_booking_requests enable row level security;

-- Reads: each side sees bookings for the coaching relationship they belong to.

create policy booking_select_coach on public.session_booking_requests
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy booking_select_klient on public.session_booking_requests
  for select to authenticated
  using (client_id = public.current_client_id());

-- Creates: the proposing party's identity and role must match the row they
-- insert; status must start pending. Accept/decline/cancel all happen
-- through the RPCs below instead of direct UPDATE policies, since they need
-- to check which side is the *receiving* party (the opposite of
-- requested_by_role) and stamp responded_at server-side.

create policy booking_insert_coach on public.session_booking_requests
  for insert to authenticated
  with check (
    public.client_owned_by_current_coach(client_id)
    and requested_by_role = 'coach'
    and status = 'pending'
  );

create policy booking_insert_klient on public.session_booking_requests
  for insert to authenticated
  with check (
    client_id = public.current_client_id()
    and requested_by_role = 'klient'
    and status = 'pending'
  );

grant select, insert on table public.session_booking_requests to authenticated;

-- ------------------------------------------------------------------- accept
--
-- Atomic: locks the booking row, verifies the caller is the receiving party
-- (never the party who proposed it), creates exactly one `sessions` row
-- using the existing per-client sequential numbering, links it back, and
-- marks the booking accepted — all in one function invocation/transaction.

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

grant execute on function public.accept_session_booking(uuid) to authenticated;
revoke execute on function public.accept_session_booking(uuid) from public, anon;

-- ------------------------------------------------------------------ decline

create or replace function public.decline_session_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid := public.current_coach_id();
  v_client_id uuid := public.current_client_id();
  v_booking public.session_booking_requests;
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
      raise exception 'not authorized to decline this booking';
    end if;
  else
    if v_client_id is null or v_client_id <> v_booking.client_id then
      raise exception 'not authorized to decline this booking';
    end if;
  end if;

  update public.session_booking_requests
  set status = 'declined', responded_at = now()
  where id = p_booking_id;
end;
$$;

grant execute on function public.decline_session_booking(uuid) to authenticated;
revoke execute on function public.decline_session_booking(uuid) from public, anon;

-- -------------------------------------------------------------------- cancel
--
-- Only the party who proposed the booking may cancel it, and only while
-- still pending.

create or replace function public.cancel_session_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid := public.current_coach_id();
  v_client_id uuid := public.current_client_id();
  v_booking public.session_booking_requests;
begin
  select * into v_booking from public.session_booking_requests where id = p_booking_id for update;
  if not found then
    raise exception 'booking not found';
  end if;
  if v_booking.status <> 'pending' then
    raise exception 'booking is not pending';
  end if;

  if v_booking.requested_by_role = 'coach' then
    if v_coach_id is null or not public.client_owned_by_current_coach(v_booking.client_id) then
      raise exception 'not authorized to cancel this booking';
    end if;
  else
    if v_client_id is null or v_client_id <> v_booking.client_id then
      raise exception 'not authorized to cancel this booking';
    end if;
  end if;

  update public.session_booking_requests
  set status = 'cancelled', responded_at = now()
  where id = p_booking_id;
end;
$$;

grant execute on function public.cancel_session_booking(uuid) to authenticated;
revoke execute on function public.cancel_session_booking(uuid) from public, anon;
