-- Calendar availability (src/lib/portal/availability.ts), the area of the
-- 2026-10-14 calendar fault. Every case rolls back.

begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_settings int;
  v_rows int;
  v_rule uuid;
  v_exceptions int;
begin
  select count(*) into v_settings from public.coach_booking_settings;
  if v_settings <> 1 then raise exception 'FAIL coach sees % settings rows', v_settings; end if;

  with u as (
    update public.coach_booking_settings
    set meeting_duration_minutes = 90, buffer_minutes = 15, minimum_notice_hours = 24,
        booking_horizon_days = 30, public_booking_enabled = true, updated_at = now()
    where coach_id = 'a0000000-0000-4000-8000-00000000000a'
    returning 1
  ) select count(*) into v_rows from u;
  if v_rows <> 1 then raise exception 'FAIL settings update touched % rows', v_rows; end if;

  insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
  values ('a0000000-0000-4000-8000-00000000000a', 1, '08:00', '10:00') returning id into v_rule;
  delete from public.coach_availability_rules where id = v_rule;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'FAIL rule delete touched % rows', v_rows; end if;

  select count(*) into v_exceptions
  from public.replace_coach_availability_exception('2026-11-03', 'unavailable', '[]'::jsonb);
  if v_exceptions <> 1 then raise exception 'FAIL exception replace returned % rows', v_exceptions; end if;
  delete from public.coach_availability_exceptions where date = '2026-11-03';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'FAIL exception delete touched % rows', v_rows; end if;

  raise notice 'ok - coach reads settings, saves them, adds and removes rules and exceptions';
end $$;
rollback;

-- The public slug, timezone and owner stay read-only.
begin;
select test_harness.act_as('coach_a');
do $$
begin
  update public.coach_booking_settings set public_slug = 'kapad' where coach_id = 'a0000000-0000-4000-8000-00000000000a';
  raise exception 'FAIL public_slug was writable';
exception when insufficient_privilege then
  raise notice 'ok - public_slug is read-only';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  update public.coach_booking_settings set coach_id = 'b0000000-0000-4000-8000-00000000000b';
  raise exception 'FAIL coach_id was writable';
exception when insufficient_privilege then
  raise notice 'ok - settings owner is read-only';
end $$;
rollback;

-- Another coach neither sees nor changes coach A's availability.
begin;
select test_harness.act_as('coach_b');
do $$
declare v_rows int;
begin
  with u as (update public.coach_booking_settings set buffer_minutes = 0
             where coach_id = 'a0000000-0000-4000-8000-00000000000a' returning 1)
  select count(*) into v_rows from u;
  if v_rows <> 0 or exists (select 1 from public.coach_booking_settings where coach_id = 'a0000000-0000-4000-8000-00000000000a') then
    raise exception 'FAIL coach B reached coach A''s settings';
  end if;
  raise notice 'ok - another coach cannot read or change the settings';
end $$;
rollback;

begin;
select test_harness.act_as('coach_b');
do $$
begin
  insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
  values ('a0000000-0000-4000-8000-00000000000a', 2, '08:00', '10:00');
  raise exception 'FAIL coach B added a rule for coach A';
exception when insufficient_privilege then
  raise notice 'ok - another coach cannot add rules for the coach';
end $$;
rollback;

-- A client has no access to availability administration.
begin;
select test_harness.act_as('client_x');
do $$
begin
  if exists (select 1 from public.coach_booking_settings) or exists (select 1 from public.coach_availability_rules) then
    raise exception 'FAIL client reads availability administration';
  end if;
  insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
  values ('a0000000-0000-4000-8000-00000000000a', 3, '08:00', '10:00');
  raise exception 'FAIL client added a rule';
exception when insufficient_privilege then
  raise notice 'ok - client cannot read or write availability administration';
end $$;
rollback;

-- Anonymous visitors only get the public booking functions.
begin;
select test_harness.act_as('anon');
do $$
begin
  perform public.get_public_booking_status('coach-a');
  perform * from public.get_public_booking_slots('coach-a', current_date, current_date + 7);
  perform 1 from public.coach_booking_settings;
  raise exception 'FAIL anon read coach_booking_settings';
exception when insufficient_privilege then
  raise notice 'ok - anon uses the public booking functions but not the tables';
end $$;
rollback;
