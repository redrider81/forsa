-- Coach explicitly approves a session summary for client sharing.
-- Persists structured summary fields and sets approved = true server-side.

create or replace function public.approve_session_summary(
  p_session_id uuid,
  p_client_id uuid,
  p_focus text,
  p_insights text[],
  p_awareness text,
  p_new_perspectives text[],
  p_commitments text[],
  p_follow_up text[],
  p_possible_next_focus text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if not public.session_owned_by_current_coach(p_session_id) then
    raise exception 'Session not found or unauthorized';
  end if;

  if not exists (
    select 1
    from public.sessions s
    where s.id = p_session_id
      and s.client_id = p_client_id
  ) then
    raise exception 'Session not found or unauthorized';
  end if;

  insert into public.session_summaries (
    session_id,
    focus,
    insights,
    awareness,
    new_perspectives,
    commitments,
    follow_up,
    possible_next_focus,
    approved,
    approved_at
  ) values (
    p_session_id,
    coalesce(p_focus, ''),
    coalesce(p_insights, '{}'),
    coalesce(p_awareness, ''),
    coalesce(p_new_perspectives, '{}'),
    coalesce(p_commitments, '{}'),
    coalesce(p_follow_up, '{}'),
    coalesce(p_possible_next_focus, ''),
    true,
    now()
  )
  on conflict (session_id) do update set
    focus = excluded.focus,
    insights = excluded.insights,
    awareness = excluded.awareness,
    new_perspectives = excluded.new_perspectives,
    commitments = excluded.commitments,
    follow_up = excluded.follow_up,
    possible_next_focus = excluded.possible_next_focus,
    approved = true,
    approved_at = now();

  return p_session_id;
end;
$$;

grant execute on function public.approve_session_summary(
  uuid,
  uuid,
  text,
  text[],
  text,
  text[],
  text[],
  text[],
  text
) to authenticated;

revoke execute on function public.approve_session_summary(
  uuid,
  uuid,
  text,
  text[],
  text,
  text[],
  text[],
  text[],
  text
) from public, anon;
