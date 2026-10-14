-- P1-02: "Avsluta möte" (src/app/api/portal/mote/complete/route.ts →
-- complete_coaching_session). Synthetic sessions only; every case rolls back.

-- The owning coach completes her client's upcoming session.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_result uuid;
  v_session public.sessions;
  v_summary public.session_summaries;
begin
  v_result := public.complete_coaching_session(
    '50000000-0000-4000-8000-0000000000e1', 'Insikt', array['i1'], array['c1'], array['f1'], 'Nästa'
  );
  if v_result is distinct from '50000000-0000-4000-8000-0000000000e1'::uuid then
    raise exception 'FAIL unexpected result %', v_result;
  end if;

  select * into v_session from public.sessions where id = '50000000-0000-4000-8000-0000000000e1';
  if v_session.status <> 'genomford' then raise exception 'FAIL status is %', v_session.status; end if;
  if (v_session.client_focus, v_session.desired_outcome, v_session.date, v_session.time, v_session.client_id)
     <> ('Fokus X', 'Utfall X', '2026-10-01'::date, '10:00', 'c0000000-0000-4000-8000-0000000000e1'::uuid) then
    raise exception 'FAIL session data changed';
  end if;

  select * into v_summary from public.session_summaries where session_id = '50000000-0000-4000-8000-0000000000e1';
  if v_summary.awareness <> 'Insikt' or v_summary.approved then
    raise exception 'FAIL summary draft not stored as unapproved';
  end if;
  raise notice 'ok - coach completes own session, session data preserved, draft unapproved';
end $$;
rollback;

-- A completed session cannot be completed again.
begin;
select test_harness.act_as('coach_a');
select public.complete_coaching_session('50000000-0000-4000-8000-0000000000e1', 'a', '{}', '{}', '{}', 'n');
do $$
begin
  perform public.complete_coaching_session('50000000-0000-4000-8000-0000000000e1', 'b', '{}', '{}', '{}', 'n');
  raise exception 'FAIL second completion accepted';
exception when raise_exception then
  if sqlerrm <> 'Session already completed' then raise; end if;
  raise notice 'ok - completed session cannot be completed again';
end $$;
rollback;

-- The report flow still works on a completed session.
begin;
select test_harness.act_as('coach_a');
select public.complete_coaching_session('50000000-0000-4000-8000-0000000000e1', 'a', '{}', '{}', '{}', 'n');
do $$
declare v_approved boolean;
begin
  perform public.approve_session_summary(
    '50000000-0000-4000-8000-0000000000e1', 'c0000000-0000-4000-8000-0000000000e1',
    'f', '{}', 'a', '{}', '{}', '{}', 'n'
  );
  select approved into v_approved from public.session_summaries where session_id = '50000000-0000-4000-8000-0000000000e1';
  if not v_approved then raise exception 'FAIL summary not approved'; end if;
  raise notice 'ok - summary approval still works after completion';
end $$;
rollback;

-- Another coach cannot complete the session.
begin;
select test_harness.act_as('coach_b');
do $$
begin
  perform public.complete_coaching_session('50000000-0000-4000-8000-0000000000e1', 'a', '{}', '{}', '{}', 'n');
  raise exception 'FAIL coach B completed coach A''s session';
exception when raise_exception then
  if sqlerrm <> 'Session not found or unauthorized' then raise; end if;
  raise notice 'ok - another coach cannot complete the session';
end $$;
rollback;

-- An unknown session is refused the same way.
begin;
select test_harness.act_as('coach_a');
do $$
begin
  perform public.complete_coaching_session(gen_random_uuid(), 'a', '{}', '{}', '{}', 'n');
  raise exception 'FAIL unknown session accepted';
exception when raise_exception then
  if sqlerrm <> 'Session not found or unauthorized' then raise; end if;
  raise notice 'ok - unknown session is refused';
end $$;
rollback;

-- A client cannot complete a session, not even her own.
begin;
select test_harness.act_as('client_x');
do $$
begin
  perform public.complete_coaching_session('50000000-0000-4000-8000-0000000000e1', 'a', '{}', '{}', '{}', 'n');
  raise exception 'FAIL client completed a session';
exception when raise_exception then
  if sqlerrm <> 'Unauthorized' then raise; end if;
  raise notice 'ok - client cannot complete a session';
end $$;
rollback;

-- Anonymous callers cannot execute the function.
begin;
select test_harness.act_as('anon');
do $$
begin
  perform public.complete_coaching_session('50000000-0000-4000-8000-0000000000e1', 'a', '{}', '{}', '{}', 'n');
  raise exception 'FAIL anon executed complete_coaching_session';
exception when insufficient_privilege then
  raise notice 'ok - anon cannot execute complete_coaching_session';
end $$;
rollback;

-- Nothing above persisted.
do $$
begin
  if (select status from public.sessions where id = '50000000-0000-4000-8000-0000000000e1') <> 'kommande'
     or exists (select 1 from public.session_summaries where session_id = '50000000-0000-4000-8000-0000000000e1') then
    raise exception 'FAIL test writes leaked out of their transactions';
  end if;
  raise notice 'ok - all meeting-completion test writes rolled back';
end $$;
