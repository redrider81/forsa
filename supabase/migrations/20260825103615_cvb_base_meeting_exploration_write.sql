-- CVB Base — active meeting workspace: lets the coach persist the "Vad
-- behöver utforskas?" field into the existing session_preparations.follow_up
-- column via one narrowly-scoped RPC, rather than a direct coach write
-- policy (a bare UPDATE policy can't guarantee a row exists yet for this
-- client; the RPC upserts on the table's existing client_id uniqueness and
-- leaves focus/desired_outcome/changed untouched).

create or replace function public.upsert_coach_meeting_exploration(
  p_session_id uuid,
  p_follow_up text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid := public.current_coach_id();
  v_client_id uuid;
begin
  if v_coach_id is null then
    raise exception 'not a coach session';
  end if;

  select client_id into v_client_id from public.sessions where id = p_session_id;
  if v_client_id is null then
    raise exception 'session not found';
  end if;

  if not public.client_owned_by_current_coach(v_client_id) then
    raise exception 'not authorized for this session';
  end if;

  insert into public.session_preparations (client_id, session_id, follow_up, updated_at)
  values (v_client_id, p_session_id, p_follow_up, now())
  on conflict (client_id) do update
  set follow_up = excluded.follow_up,
      session_id = excluded.session_id,
      updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.upsert_coach_meeting_exploration(uuid, text) to authenticated;
revoke execute on function public.upsert_coach_meeting_exploration(uuid, text) from public, anon;
