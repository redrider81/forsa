-- CVB Base — function privilege hardening, per Supabase security advisor.
-- Postgres grants EXECUTE to PUBLIC by default, which makes these functions
-- reachable by the unauthenticated `anon` role via PostgREST. Each already
-- resolves safely for an unauthenticated caller (current_coach_id()/
-- current_client_id() return NULL, and the two RPCs raise an exception when
-- they do), but least privilege means anon shouldn't reach them at all.

revoke execute on function public.current_coach_id() from public, anon;
revoke execute on function public.current_client_id() from public, anon;
revoke execute on function public.client_owned_by_current_coach(uuid) from public, anon;
revoke execute on function public.session_owned_by_current_coach(uuid) from public, anon;
revoke execute on function public.update_own_client_profile(text, text, text, text) from public, anon;
revoke execute on function public.update_own_commitment_status(uuid, public.commitment_status, text, date) from public, anon;

grant execute on function public.current_coach_id() to authenticated;
grant execute on function public.current_client_id() to authenticated;
grant execute on function public.client_owned_by_current_coach(uuid) to authenticated;
grant execute on function public.session_owned_by_current_coach(uuid) to authenticated;
