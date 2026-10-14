-- CVB Base — missing base table privileges for the coach availability tables.
-- coach_booking_settings, coach_availability_rules and
-- coach_availability_exceptions have carried RLS policies for the coach
-- since 20260826190000_cvb_base_availability, but never the matching base
-- grants (new tables are not auto-exposed, see supabase/config.toml). The
-- coach's own reads failed with 42501 before RLS was evaluated, so the
-- Tillgänglighet view rendered nothing and no change could be saved.
--
-- Least privilege, matching the application's actual calls in
-- src/lib/portal/availability.ts. Every row stays filtered by the existing
-- policies (coach_id = public.current_coach_id()); no policy is changed.
--
-- - Settings: read, and update only the booking-rule columns the app writes.
--   coach_id, public_slug and timezone stay read-only.
-- - Rules: read, add and remove a weekly block.
-- - Exceptions: read and remove. New exceptions are written exclusively
--   through replace_coach_availability_exception() (security definer), so no
--   insert privilege is granted.
--
-- Nothing is granted to anon or public.

grant select on table public.coach_booking_settings to authenticated;
grant update (
  meeting_duration_minutes,
  buffer_minutes,
  minimum_notice_hours,
  booking_horizon_days,
  public_booking_enabled,
  updated_at
) on table public.coach_booking_settings to authenticated;

grant select, insert, delete on table public.coach_availability_rules to authenticated;

grant select, delete on table public.coach_availability_exceptions to authenticated;
