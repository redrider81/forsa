-- Public introductory calls as 30-minute slots
-- (20261015120000_cvb_base_public_half_hour_slots). Every case rolls back.
--
-- The test day is the Monday two weeks ahead, so it is always inside the
-- default 30-day horizon and outside the default 24-hour notice. Coach A has
-- no sessions or requests near it in the fixtures.

-- 1–2. An available two-hour block becomes four real half-hours.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_starts text[];
  v_bad int;
begin
  select array_agg(to_char(start_at at time zone 'Europe/Stockholm', 'HH24:MI') order by start_at)
  into v_starts
  from public.get_public_booking_slots('coach-a', v_d, v_d);
  if v_starts is distinct from array['10:00', '10:30', '11:00', '11:30'] then
    raise exception 'FAIL 10–12 block yielded %', v_starts;
  end if;
  raise notice 'ok - an available 10–12 block yields exactly four bookable half-hours';

  select count(*) into v_bad
  from public.get_public_booking_slots('coach-a', v_d, v_d) s
  where s.end_at - s.start_at <> interval '30 minutes'
     or s.date <> v_d
     or (s.start_at at time zone 'Europe/Stockholm')::date <> v_d;
  if v_bad <> 0 then raise exception 'FAIL % slots have the wrong date or length', v_bad; end if;
  raise notice 'ok - every half-hour has the correct date, start and end';
end $$;
rollback;

-- Only the half-hour shape is accepted; the old two-hour block is not.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_case record;
begin
  for v_case in
    select * from (values
      ('old two-hour block', v_d + time '10:00', v_d + time '12:00'),
      ('one hour', v_d + time '10:00', v_d + time '11:00'),
      ('off the half-hour grid', v_d + time '10:15', v_d + time '10:45'),
      ('lunch', v_d + time '12:00', v_d + time '12:30'),
      ('after 17:00', v_d + time '17:00', v_d + time '17:30'),
      ('saturday', v_d + 5 + time '10:00', v_d + 5 + time '10:30')
    ) as c(label, local_start, local_end)
  loop
    begin
      perform public.create_public_booking_request(
        'coach-a', 'Test Person', 'test@example.invalid', '070', null,
        v_case.local_start at time zone 'Europe/Stockholm', v_case.local_end at time zone 'Europe/Stockholm');
      raise exception 'FAIL % was accepted', v_case.label;
    exception when raise_exception then
      if sqlerrm <> 'INVALID_SLOT' then raise exception 'FAIL % raised %', v_case.label, sqlerrm; end if;
    end;
  end loop;
  raise notice 'ok - only 30-minute half-hours inside the fixed blocks are accepted';
end $$;
rollback;

-- 3. A half-hour in a block Carolina has not opened cannot be booked.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_start time;
begin
  foreach v_start in array array['08:00', '09:30', '13:00', '16:30']::time[] loop
    begin
      perform public.create_public_booking_request(
        'coach-a', 'Test Person', 'test@example.invalid', '070', null,
        (v_d + v_start) at time zone 'Europe/Stockholm', (v_d + v_start + interval '30 minutes') at time zone 'Europe/Stockholm');
      raise exception 'FAIL closed half-hour % was booked', v_start;
    exception when raise_exception then
      if sqlerrm <> 'SLOT_UNAVAILABLE' then raise exception 'FAIL % raised %', v_start, sqlerrm; end if;
    end;
  end loop;
  raise notice 'ok - a half-hour in an unavailable block cannot be booked';
end $$;
rollback;

-- 4 + 9. A booked half-hour leaves the offer; the rest of the block stays.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_starts text[];
begin
  perform public.create_public_booking_request(
    'coach-a', 'Test Person', 'test@example.invalid', '070', null,
    (v_d + time '10:30') at time zone 'Europe/Stockholm', (v_d + time '11:00') at time zone 'Europe/Stockholm');

  select array_agg(to_char(start_at at time zone 'Europe/Stockholm', 'HH24:MI') order by start_at)
  into v_starts
  from public.get_public_booking_slots('coach-a', v_d, v_d);
  if v_starts is distinct from array['10:00', '11:00', '11:30'] then
    raise exception 'FAIL after booking 10:30 the offer is %', v_starts;
  end if;

  begin
    perform public.create_public_booking_request(
      'coach-a', 'Annan Person', 'annan@example.invalid', '070', null,
      (v_d + time '10:30') at time zone 'Europe/Stockholm', (v_d + time '11:00') at time zone 'Europe/Stockholm');
    raise exception 'FAIL the taken half-hour was booked again';
  exception when raise_exception then
    if sqlerrm <> 'SLOT_UNAVAILABLE' then raise exception 'FAIL second booking raised %', sqlerrm; end if;
  end;
  raise notice 'ok - a booked half-hour is no longer offered, cannot be rebooked and blocks only its own 30 minutes';
end $$;
reset role;
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_request public.public_booking_requests;
  v_events text[];
begin
  select * into v_request from public.public_booking_requests
  where coach_id = 'a0000000-0000-4000-8000-00000000000a';
  if v_request.status <> 'pending'
     or v_request.requested_start_at <> (v_d + time '10:30') at time zone 'Europe/Stockholm'
     or v_request.requested_end_at <> (v_d + time '11:00') at time zone 'Europe/Stockholm' then
    raise exception 'FAIL stored request is % %–%', v_request.status, v_request.requested_start_at, v_request.requested_end_at;
  end if;

  select array_agg(event_type order by event_type) into v_events
  from public.public_booking_notifications where request_id = v_request.id;
  if v_events is distinct from array['coach_new_request', 'customer_request_received'] then
    raise exception 'FAIL queued notifications are %', v_events;
  end if;
  raise notice 'ok - the request is pending with the exact half-hour, and no confirmation is queued yet';
end $$;
rollback;

-- 6. Date exceptions are respected: unavailable closes the day, custom
-- replaces the weekly blocks for that day.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00'),
       ('a0000000-0000-4000-8000-00000000000a', 2, '10:00', '12:00');
insert into public.coach_availability_exceptions (coach_id, date, type)
values ('a0000000-0000-4000-8000-00000000000a', date_trunc('week', current_date + 14)::date, 'unavailable');
insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', date_trunc('week', current_date + 14)::date + 1, 'custom', '13:00', '15:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_count int;
  v_starts text[];
begin
  select count(*) into v_count from public.get_public_booking_slots('coach-a', v_d, v_d);
  if v_count <> 0 then raise exception 'FAIL unavailable day offers % slots', v_count; end if;

  select array_agg(to_char(start_at at time zone 'Europe/Stockholm', 'HH24:MI') order by start_at)
  into v_starts
  from public.get_public_booking_slots('coach-a', v_d + 1, v_d + 1);
  if v_starts is distinct from array['13:00', '13:30', '14:00', '14:30'] then
    raise exception 'FAIL custom day offers %', v_starts;
  end if;

  begin
    perform public.create_public_booking_request(
      'coach-a', 'Test Person', 'test@example.invalid', '070', null,
      (v_d + time '10:00') at time zone 'Europe/Stockholm', (v_d + time '10:30') at time zone 'Europe/Stockholm');
    raise exception 'FAIL booked on an unavailable day';
  exception when raise_exception then
    if sqlerrm <> 'SLOT_UNAVAILABLE' then raise exception 'FAIL unavailable day raised %', sqlerrm; end if;
  end;

  begin
    perform public.create_public_booking_request(
      'coach-a', 'Test Person', 'test@example.invalid', '070', null,
      (v_d + 1 + time '10:00') at time zone 'Europe/Stockholm', (v_d + 1 + time '10:30') at time zone 'Europe/Stockholm');
    raise exception 'FAIL booked a weekly block the custom exception replaced';
  exception when raise_exception then
    if sqlerrm <> 'SLOT_UNAVAILABLE' then raise exception 'FAIL replaced block raised %', sqlerrm; end if;
  end;

  perform public.create_public_booking_request(
    'coach-a', 'Test Person', 'test@example.invalid', '070', null,
    (v_d + 1 + time '13:30') at time zone 'Europe/Stockholm', (v_d + 1 + time '14:00') at time zone 'Europe/Stockholm');
  raise notice 'ok - date exceptions are respected for half-hour slots';
end $$;
rollback;

-- 7. Legacy two-hour requests stay untouched and block every half-hour
-- they overlap.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00'),
       ('a0000000-0000-4000-8000-00000000000a', 1, '13:00', '15:00'),
       ('a0000000-0000-4000-8000-00000000000a', 1, '15:00', '17:00');
insert into public.public_booking_requests (id, coach_id, name, email, requested_start_at, requested_end_at, status)
values
  ('9b000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000a', 'Legacy Accepted', 'legacy1@example.invalid',
   (date_trunc('week', current_date + 14)::date + time '10:00') at time zone 'Europe/Stockholm',
   (date_trunc('week', current_date + 14)::date + time '12:00') at time zone 'Europe/Stockholm', 'accepted'),
  ('9b000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-00000000000a', 'Legacy Pending', 'legacy2@example.invalid',
   (date_trunc('week', current_date + 14)::date + time '15:00') at time zone 'Europe/Stockholm',
   (date_trunc('week', current_date + 14)::date + time '17:00') at time zone 'Europe/Stockholm', 'pending');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_starts text[];
  v_start time;
begin
  select array_agg(to_char(start_at at time zone 'Europe/Stockholm', 'HH24:MI') order by start_at)
  into v_starts
  from public.get_public_booking_slots('coach-a', v_d, v_d);
  if v_starts is distinct from array['13:00', '13:30', '14:00', '14:30'] then
    raise exception 'FAIL legacy requests leave the offer %', v_starts;
  end if;

  foreach v_start in array array['10:00', '11:30', '15:00', '16:30']::time[] loop
    begin
      perform public.create_public_booking_request(
        'coach-a', 'Test Person', 'test@example.invalid', '070', null,
        (v_d + v_start) at time zone 'Europe/Stockholm', (v_d + v_start + interval '30 minutes') at time zone 'Europe/Stockholm');
      raise exception 'FAIL half-hour % overlapping a legacy request was booked', v_start;
    exception when raise_exception then
      if sqlerrm <> 'SLOT_UNAVAILABLE' then raise exception 'FAIL % raised %', v_start, sqlerrm; end if;
    end;
  end loop;
end $$;
reset role;
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_intact int;
begin
  select count(*) into v_intact from public.public_booking_requests
  where (id = '9b000000-0000-4000-8000-000000000001' and status = 'accepted'
         and requested_start_at = (v_d + time '10:00') at time zone 'Europe/Stockholm'
         and requested_end_at = (v_d + time '12:00') at time zone 'Europe/Stockholm')
     or (id = '9b000000-0000-4000-8000-000000000002' and status = 'pending'
         and requested_start_at = (v_d + time '15:00') at time zone 'Europe/Stockholm'
         and requested_end_at = (v_d + time '17:00') at time zone 'Europe/Stockholm');
  if v_intact <> 2 then raise exception 'FAIL legacy requests changed'; end if;
  raise notice 'ok - legacy two-hour requests stay intact and block every overlapping half-hour';
end $$;
rollback;

-- 8. Carolina's existing administration — weekly blocks, the atomic
-- exception RPC and the public on/off switch — decides what is offered.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_starts text[];
begin
  update public.coach_booking_settings set public_booking_enabled = true, updated_at = now()
  where coach_id = 'a0000000-0000-4000-8000-00000000000a';
  insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
  values ('a0000000-0000-4000-8000-00000000000a', 1, '13:00', '15:00');
  perform * from public.replace_coach_availability_exception(
    v_d + 1, 'custom', '[{"startTime": "08:00", "endTime": "10:00"}]'::jsonb);

  select array_agg(to_char(start_at at time zone 'Europe/Stockholm', 'YYYY-MM-DD HH24:MI') order by start_at)
  into v_starts
  from public.get_public_booking_slots('coach-a', v_d, v_d + 1);
  if v_starts is distinct from array[
    to_char(v_d, 'YYYY-MM-DD') || ' 13:00', to_char(v_d, 'YYYY-MM-DD') || ' 13:30',
    to_char(v_d, 'YYYY-MM-DD') || ' 14:00', to_char(v_d, 'YYYY-MM-DD') || ' 14:30',
    to_char(v_d + 1, 'YYYY-MM-DD') || ' 08:00', to_char(v_d + 1, 'YYYY-MM-DD') || ' 08:30',
    to_char(v_d + 1, 'YYYY-MM-DD') || ' 09:00', to_char(v_d + 1, 'YYYY-MM-DD') || ' 09:30'
  ] then
    raise exception 'FAIL coach-controlled offer is %', v_starts;
  end if;

  -- The administration model itself is unchanged: blocks, not half-hours.
  begin
    perform * from public.replace_coach_availability_exception(
      v_d + 2, 'custom', '[{"startTime": "10:00", "endTime": "10:30"}]'::jsonb);
    raise exception 'FAIL exception RPC accepted a bare half-hour';
  exception when raise_exception then
    if sqlerrm <> 'INVALID_BLOCKS' then raise exception 'FAIL exception RPC raised %', sqlerrm; end if;
  end;

  update public.coach_booking_settings set public_booking_enabled = false, updated_at = now()
  where coach_id = 'a0000000-0000-4000-8000-00000000000a';
  if exists (select 1 from public.get_public_booking_slots('coach-a', v_d, v_d + 1)) then
    raise exception 'FAIL paused booking still offers slots';
  end if;
  raise notice 'ok - Carolina''s existing weekly blocks, exceptions and pause switch control the half-hours offered';
end $$;
rollback;

-- 10. The confirmation is queued only when Carolina accepts; a declined
-- half-hour is released.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
select request_id from public.create_public_booking_request(
  'coach-a', 'Accept Person', 'accept@example.invalid', '070', null,
  (date_trunc('week', current_date + 14)::date + time '10:00') at time zone 'Europe/Stockholm',
  (date_trunc('week', current_date + 14)::date + time '10:30') at time zone 'Europe/Stockholm') \gset accepted_
select request_id from public.create_public_booking_request(
  'coach-a', 'Decline Person', 'decline@example.invalid', '070', null,
  (date_trunc('week', current_date + 14)::date + time '11:00') at time zone 'Europe/Stockholm',
  (date_trunc('week', current_date + 14)::date + time '11:30') at time zone 'Europe/Stockholm') \gset declined_
select set_config('test.accepted_id', :'accepted_request_id', true), set_config('test.declined_id', :'declined_request_id', true);
reset role;
select test_harness.act_as('coach_a');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_accepted uuid := current_setting('test.accepted_id')::uuid;
  v_declined uuid := current_setting('test.declined_id')::uuid;
  v_starts text[];
begin
  if exists (select 1 from public.public_booking_notifications
             where request_id = v_accepted and event_type = 'customer_request_accepted') then
    raise exception 'FAIL confirmation queued before acceptance';
  end if;

  perform public.respond_public_booking_request(v_accepted, 'accept');
  perform public.respond_public_booking_request(v_declined, 'decline');

  if (select status from public.public_booking_requests where id = v_accepted) <> 'accepted'
     or (select count(*) from public.public_booking_notifications
         where request_id = v_accepted and event_type = 'customer_request_accepted') <> 1 then
    raise exception 'FAIL acceptance did not queue exactly one confirmation';
  end if;
  if (select status from public.public_booking_requests where id = v_declined) <> 'declined' then
    raise exception 'FAIL decline did not apply';
  end if;

  select array_agg(to_char(start_at at time zone 'Europe/Stockholm', 'HH24:MI') order by start_at)
  into v_starts
  from public.get_public_booking_slots('coach-a', v_d, v_d);
  if v_starts is distinct from array['10:30', '11:00', '11:30'] then
    raise exception 'FAIL after accept/decline the offer is %', v_starts;
  end if;
  raise notice 'ok - the confirmation is queued only when Carolina accepts, and a declined half-hour is released';
end $$;
rollback;

-- 12. Other booking types keep their own shapes and still block exactly
-- the half-hours they overlap: a 60-minute session at 14:00 and a pending
-- internal 60-minute request at 15:15.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '13:00', '15:00'),
       ('a0000000-0000-4000-8000-00000000000a', 1, '15:00', '17:00');
insert into public.sessions (client_id, number, date, time, duration_minutes, status, location)
values ('c0000000-0000-4000-8000-0000000000e1', 90, date_trunc('week', current_date + 14)::date, '14:00', 60, 'kommande', 'Plats');
insert into public.session_booking_requests (client_id, requested_by_role, date, time, duration_minutes, status)
values ('c0000000-0000-4000-8000-0000000000e1', 'klient', date_trunc('week', current_date + 14)::date, '15:15', 60, 'pending');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_starts text[];
begin
  select array_agg(to_char(start_at at time zone 'Europe/Stockholm', 'HH24:MI') order by start_at)
  into v_starts
  from public.get_public_booking_slots('coach-a', v_d, v_d);
  if v_starts is distinct from array['13:00', '13:30', '16:30'] then
    raise exception 'FAIL session and internal request leave the offer %', v_starts;
  end if;
  raise notice 'ok - sessions and internal booking requests block exactly the half-hours they overlap';
end $$;
rollback;

-- An internal booking keeps its free shape (weekend, off-grid, 50 minutes)
-- and still cannot be accepted over a live public half-hour.
begin;
insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
values ('a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';
select test_harness.act_as('anon');
do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
begin
  perform public.create_public_booking_request(
    'coach-a', 'Test Person', 'test@example.invalid', '070', null,
    (v_d + time '10:00') at time zone 'Europe/Stockholm', (v_d + time '10:30') at time zone 'Europe/Stockholm');
end $$;
reset role;
insert into public.session_booking_requests (id, client_id, requested_by_role, date, time, duration_minutes, status)
values
  ('5b000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-0000000000e1', 'klient', date_trunc('week', current_date + 14)::date, '10:10', 50, 'pending'),
  ('5b000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-0000000000e1', 'klient', date_trunc('week', current_date + 14)::date + 5, '09:10', 50, 'pending');
select test_harness.act_as('coach_a');
do $$
begin
  perform public.accept_session_booking('5b000000-0000-4000-8000-000000000002');

  begin
    perform public.accept_session_booking('5b000000-0000-4000-8000-000000000001');
    raise exception 'FAIL internal meeting accepted over a public half-hour';
  exception when raise_exception then
    if sqlerrm <> 'SLOT_UNAVAILABLE' then raise exception 'FAIL internal accept raised %', sqlerrm; end if;
  end;
  raise notice 'ok - internal bookings keep their free times and still respect public half-hours';
end $$;
rollback;
