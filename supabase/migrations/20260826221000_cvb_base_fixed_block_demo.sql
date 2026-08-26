-- Update the public-calendar demo data for the new fixed-block model.
-- Removes the old dynamic-duration demo intervals on 2026-08-28 (which no
-- longer represent valid public blocks) and replaces them with the four
-- fixed blocks. The existing session for Sara Nyqvist that day
-- (14:00–15:00) is left untouched — it will correctly remove the
-- 13:00–15:00 block from the real public slot result via the reservation
-- conflict check, demonstrating "existing bookings remove whole
-- overlapping blocks" with real data. Idempotent.

do $$
declare
  v_coach_id uuid := '289fc70a-53be-5bda-87de-d2fcc55f79c5'; -- Carolina von Braun
  v_demo_date date := '2026-08-28';
begin
  delete from public.coach_availability_exceptions
  where coach_id = v_coach_id
    and date = v_demo_date
    and type = 'custom'
    and (start_time, end_time) not in (
      ('08:00'::time, '10:00'::time),
      ('10:00'::time, '12:00'::time),
      ('13:00'::time, '15:00'::time),
      ('15:00'::time, '17:00'::time)
    );

  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, v_demo_date, 'custom', '08:00', '10:00'
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id and date = v_demo_date and start_time = '08:00' and end_time = '10:00'
  );

  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, v_demo_date, 'custom', '10:00', '12:00'
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id and date = v_demo_date and start_time = '10:00' and end_time = '12:00'
  );

  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, v_demo_date, 'custom', '13:00', '15:00'
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id and date = v_demo_date and start_time = '13:00' and end_time = '15:00'
  );

  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, v_demo_date, 'custom', '15:00', '17:00'
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id and date = v_demo_date and start_time = '15:00' and end_time = '17:00'
  );
end $$;
