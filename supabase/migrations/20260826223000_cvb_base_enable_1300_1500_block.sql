-- Enable the 13:00–15:00 fixed public booking block on weekdays Mon–Fri.
-- The block is already defined in get_public_booking_slots; this migration
-- turns it on in Carolina's weekly availability. Idempotent.

do $$
declare
  v_coach_id uuid := '289fc70a-53be-5bda-87de-d2fcc55f79c5'; -- Carolina von Braun
  v_weekday smallint;
begin
  foreach v_weekday in array array[1, 2, 3, 4, 5]::smallint[]
  loop
    insert into public.coach_availability_rules (coach_id, weekday, start_time, end_time)
    select v_coach_id, v_weekday, '13:00'::time, '15:00'::time
    where not exists (
      select 1 from public.coach_availability_rules
      where coach_id = v_coach_id
        and weekday = v_weekday
        and start_time = '13:00'::time
        and end_time = '15:00'::time
    );
  end loop;

  -- Keep the public-calendar demo date in sync when it uses custom blocks.
  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, '2026-08-28'::date, 'custom', '13:00'::time, '15:00'::time
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id
      and date = '2026-08-28'::date
      and start_time = '13:00'::time
      and end_time = '15:00'::time
  );
end $$;
