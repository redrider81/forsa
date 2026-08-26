-- Narrow read-only status check for the public website: whether booking is
-- currently enabled for a coach slug. Replaces the earlier approach of
-- probing create_public_booking_request with deliberately invalid data —
-- a mutation RPC must never double as a status read. Exposes nothing but
-- the single boolean; no coach_id, rules, exceptions, or calendar data.

create or replace function public.get_public_booking_status(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select public_booking_enabled from public.coach_booking_settings where public_slug = p_slug),
    false
  );
$$;

grant execute on function public.get_public_booking_status(text) to anon, authenticated;
