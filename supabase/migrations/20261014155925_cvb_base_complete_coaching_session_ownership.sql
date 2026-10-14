-- CVB Base — "Avsluta möte" always failed.
-- complete_coaching_session (20260825125000) checked ownership through
-- sessions.engagement_id, a column public.sessions has never had, so every
-- call raised 42703 before any write.
--
-- Only the ownership check changes. A session belongs to a coach through its
-- client's engagement; session_owned_by_current_coach() expresses exactly
-- that relation and is the check approve_session_summary already uses. The
-- coach-session check, the "already completed" refusal, the summary upsert
-- and the status change are unchanged.

create or replace function public.complete_coaching_session(
  p_session_id uuid,
  p_awareness text,
  p_insights text[],
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
  v_result uuid;
begin
  -- Get authenticated coach
  v_coach_id := current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Verify session exists and coach has access
  if not public.session_owned_by_current_coach(p_session_id) then
    raise exception 'Session not found or unauthorized';
  end if;

  -- Check session is not already completed
  if exists (
    select 1 from sessions
    where id = p_session_id
    and status = 'genomford'
  ) then
    raise exception 'Session already completed';
  end if;

  -- UPSERT session_summaries
  insert into session_summaries (
    session_id,
    awareness,
    insights,
    commitments,
    follow_up,
    possible_next_focus,
    approved
  ) values (
    p_session_id,
    p_awareness,
    p_insights,
    p_commitments,
    p_follow_up,
    p_possible_next_focus,
    false
  )
  on conflict (session_id) do update set
    awareness = excluded.awareness,
    insights = excluded.insights,
    commitments = excluded.commitments,
    follow_up = excluded.follow_up,
    possible_next_focus = excluded.possible_next_focus,
    approved = false;

  -- Update session status to completed
  update sessions
  set status = 'genomford'
  where id = p_session_id;

  v_result := p_session_id;
  return v_result;
end;
$$;

-- Privileges stated explicitly (unchanged): coaches only, never anon.
revoke execute on function public.complete_coaching_session(uuid, text, text[], text[], text[], text) from public, anon;
grant execute on function public.complete_coaching_session(uuid, text, text[], text[], text[], text) to authenticated;
