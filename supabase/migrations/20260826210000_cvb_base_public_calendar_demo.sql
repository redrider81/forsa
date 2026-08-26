-- Minimal demo data so the public booking calendar can be visually tested:
-- activates public booking on Carolina's existing settings row, and adds a
-- custom-date availability exception with exactly three intervals on
-- 2026-08-28 (verified conflict-free against that date's one existing
-- session, including buffer). No weekly rule is invented — this is a
-- one-off demo date, not Carolina's normal schedule. Idempotent.

do $$
declare
  v_coach_id uuid := '289fc70a-53be-5bda-87de-d2fcc55f79c5'; -- Carolina von Braun
  v_demo_date date := '2026-08-28';
begin
  update public.coach_booking_settings
  set
    public_booking_enabled = true,
    meeting_duration_minutes = 60,
    buffer_minutes = 15,
    minimum_notice_hours = 24,
    booking_horizon_days = 30,
    timezone = 'Europe/Stockholm',
    updated_at = now()
  where coach_id = v_coach_id;

  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, v_demo_date, 'custom', '08:00', '09:00'
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id and date = v_demo_date and start_time = '08:00' and end_time = '09:00'
  );

  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, v_demo_date, 'custom', '11:30', '12:30'
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id and date = v_demo_date and start_time = '11:30' and end_time = '12:30'
  );

  insert into public.coach_availability_exceptions (coach_id, date, type, start_time, end_time)
  select v_coach_id, v_demo_date, 'custom', '16:00', '17:00'
  where not exists (
    select 1 from public.coach_availability_exceptions
    where coach_id = v_coach_id and date = v_demo_date and start_time = '16:00' and end_time = '17:00'
  );
end $$;
