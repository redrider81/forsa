-- Two genuinely simultaneous public bookings (runs as supabase_admin, which
-- dblink needs to open the two extra sessions over the container's trusted
-- loopback). Both sessions act as `anon`, exactly like the public website.
--
-- Session A reserves a half-hour and stays uncommitted. Session B then asks
-- for the same half-hour: its pre-checks cannot see A's uncommitted row, so
-- it reaches the insert and has to wait on A. When A commits, B must fail
-- with SLOT_UNAVAILABLE. A neighbouring half-hour must not be blocked.
--
-- Setup is committed so the other sessions can see it, and removed again
-- at the end; this is a throwaway test database.

create extension if not exists dblink;

insert into public.coach_availability_rules (id, coach_id, weekday, start_time, end_time)
values ('5c000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000a', 1, '10:00', '12:00');
update public.coach_booking_settings set public_booking_enabled = true where public_slug = 'coach-a';

create function pg_temp.book_sql(p_name text, p_local_start time) returns text
language sql as $f$
  select format(
    $q$do $x$ begin
      perform test_harness.act_as('anon');
      perform public.create_public_booking_request('coach-a', %L, %L, '070', null, %L::timestamptz, %L::timestamptz);
    end $x$$q$,
    p_name, lower(replace(p_name, ' ', '.')) || '@example.invalid',
    (date_trunc('week', current_date + 14)::date + p_local_start) at time zone 'Europe/Stockholm',
    (date_trunc('week', current_date + 14)::date + p_local_start + interval '30 minutes') at time zone 'Europe/Stockholm')
$f$;

do $$
declare
  v_d date := date_trunc('week', current_date + 14)::date;
  v_waiting boolean;
  v_b_error text;
  v_active int;
begin
  perform dblink_connect('cvb_a', 'host=127.0.0.1 dbname=postgres user=postgres');
  perform dblink_connect('cvb_b', 'host=127.0.0.1 dbname=postgres user=postgres');

  perform dblink_exec('cvb_a', 'begin');
  perform dblink_exec('cvb_a', pg_temp.book_sql('Session A', '10:30'));

  perform dblink_exec('cvb_b', 'begin');
  perform dblink_send_query('cvb_b', pg_temp.book_sql('Session B', '10:30'));

  -- B must actually be blocked on A's row, not merely slow.
  for i in 1..50 loop
    select exists (
      select 1 from pg_stat_activity
      where wait_event_type = 'Lock' and query like '%Session B%'
    ) into v_waiting;
    exit when v_waiting;
    perform pg_sleep(0.1);
  end loop;
  if not v_waiting then raise exception 'FAIL session B never waited on session A'; end if;

  perform dblink_exec('cvb_a', 'commit');

  begin
    perform * from dblink_get_result('cvb_b') as r(status text);
    v_b_error := null;
  exception when others then
    v_b_error := sqlerrm;
  end;
  perform * from dblink_get_result('cvb_b', false) as r(status text);
  perform dblink_exec('cvb_b', 'rollback');

  if v_b_error is null or v_b_error not like '%SLOT_UNAVAILABLE%' then
    raise exception 'FAIL concurrent second booking ended with %', coalesce(v_b_error, 'success');
  end if;

  select count(*) into v_active from public.public_booking_requests
  where coach_id = 'a0000000-0000-4000-8000-00000000000a'
    and status in ('pending', 'accepted')
    and requested_start_at = (v_d + time '10:30') at time zone 'Europe/Stockholm';
  if v_active <> 1 then raise exception 'FAIL % active requests hold the half-hour', v_active; end if;
  raise notice 'ok - two simultaneous bookings of the same half-hour: one wins, the other gets SLOT_UNAVAILABLE';

  -- Neighbouring half-hours booked simultaneously both succeed.
  perform dblink_exec('cvb_a', 'begin');
  perform dblink_exec('cvb_a', pg_temp.book_sql('Session C', '10:00'));
  perform dblink_exec('cvb_b', 'begin');
  perform dblink_exec('cvb_b', pg_temp.book_sql('Session D', '11:00'));
  perform dblink_exec('cvb_a', 'commit');
  perform dblink_exec('cvb_b', 'commit');

  select count(*) into v_active from public.public_booking_requests
  where coach_id = 'a0000000-0000-4000-8000-00000000000a' and status = 'pending';
  if v_active <> 3 then raise exception 'FAIL neighbouring simultaneous bookings left % pending', v_active; end if;
  raise notice 'ok - simultaneous bookings of neighbouring half-hours both succeed';

  perform dblink_disconnect('cvb_a');
  perform dblink_disconnect('cvb_b');
end $$;

delete from public.public_booking_requests where coach_id = 'a0000000-0000-4000-8000-00000000000a';
delete from public.coach_availability_rules where id = '5c000000-0000-4000-8000-000000000001';
update public.coach_booking_settings set public_booking_enabled = false where public_slug = 'coach-a';
