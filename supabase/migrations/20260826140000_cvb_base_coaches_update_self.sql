-- Allow an authenticated coach to update only their own public.coaches row
-- (profile editing). No other privileges are granted.

create policy coaches_update_self on public.coaches
  for update to authenticated
  using (id = public.current_coach_id())
  with check (id = public.current_coach_id());
