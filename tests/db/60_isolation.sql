-- Coach/client isolation as enforced by GRANT and RLS. Every case rolls back.

begin;
select test_harness.act_as('coach_a');
do $$
begin
  if (select string_agg(name, ',' order by name) from public.coaches) <> 'Coach A' then
    raise exception 'FAIL coach sees other coaches';
  end if;
  if (select string_agg(name, ',' order by name) from public.clients) <> 'Klient V,Klient W,Klient X,Klient Z' then
    raise exception 'FAIL coach sees clients outside her engagements';
  end if;
  if exists (select 1 from public.sessions where client_id = 'c0000000-0000-4000-8000-0000000000f1') then
    raise exception 'FAIL coach sees another coach''s sessions';
  end if;
  raise notice 'ok - coach sees only her own coach row, clients and sessions';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
declare v_rows int;
begin
  with u as (update public.sessions set client_focus = 'kapad'
             where id = '50000000-0000-4000-8000-0000000000f1' returning 1)
  select count(*) into v_rows from u;
  if v_rows <> 0 then raise exception 'FAIL coach A updated coach B''s session'; end if;
  raise notice 'ok - coach cannot change another coach''s session';
end $$;
rollback;

begin;
select test_harness.act_as('client_x');
do $$
begin
  if (select string_agg(name, ',') from public.clients) <> 'Klient X' then
    raise exception 'FAIL client sees other clients';
  end if;
  if exists (select 1 from public.session_coach_notes) then
    raise exception 'FAIL client reads the coach''s private notes';
  end if;
  if (select string_agg(title, ',') from public.documents) <> 'delad' then
    raise exception 'FAIL client sees coach-only documents';
  end if;
  if exists (select 1 from public.reflections where client_id <> 'c0000000-0000-4000-8000-0000000000e1') then
    raise exception 'FAIL client reads other clients'' reflections';
  end if;
  raise notice 'ok - client sees only her own data and no coach-private content';
end $$;
rollback;

begin;
select test_harness.act_as('client_x');
do $$
begin
  insert into public.reflections (client_id, date, text)
  values ('c0000000-0000-4000-8000-0000000000e2', current_date, 'skriven åt en annan klient');
  raise exception 'FAIL client wrote a reflection for another client';
exception when insufficient_privilege then
  raise notice 'ok - client cannot write on behalf of another client';
end $$;
rollback;

begin;
select test_harness.act_as('client_x');
do $$
begin
  perform public.end_coach_client('c0000000-0000-4000-8000-0000000000e1');
  raise exception 'FAIL client ran a coach function';
exception when raise_exception then
  if sqlerrm <> 'Unauthorized' then raise; end if;
  raise notice 'ok - client cannot run coach functions';
end $$;
rollback;

begin;
select test_harness.act_as('client_x');
do $$
begin
  update public.profiles set role = 'coach';
  raise exception 'FAIL client changed her role';
exception when insufficient_privilege then
  raise notice 'ok - client cannot change her portal role';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  update public.contracts set status = 'signerat';
  raise exception 'FAIL coach set contract status directly';
exception when insufficient_privilege then
  raise notice 'ok - contract status changes only through the signing functions';
end $$;
rollback;

begin;
select test_harness.act_as('anon');
do $$
begin
  perform 1 from public.clients;
  raise exception 'FAIL anon read clients';
exception when insufficient_privilege then
  raise notice 'ok - anon cannot read client data';
end $$;
rollback;

-- The read paths every portal page uses must not fail for either role:
-- the application now treats a failed read as an error, not as "no data".
begin;
select test_harness.act_as('client_x');
do $$
begin
  perform 1 from public.coaches; perform 1 from public.organisations; perform 1 from public.engagements;
  perform 1 from public.milestones; perform 1 from public.clients; perform 1 from public.coaching_agreements;
  perform 1 from public.development_goals; perform 1 from public.sessions; perform 1 from public.session_summaries;
  perform 1 from public.session_coach_notes; perform 1 from public.read_session_preparations();
  perform 1 from public.reflections; perform 1 from public.insights;
  perform id, client_id, session_id, date, text, due_label, status, completed_at, created_at, updated_at from public.commitments;
  perform 1 from public.documents; perform 1 from public.materials;
  perform client_id, granted_at, withdrawn_at from public.special_category_consents;
  perform 1 from public.read_commitment_client_notes();
  raise notice 'ok - every portal snapshot read succeeds for a client';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  perform 1 from public.coaches; perform 1 from public.organisations; perform 1 from public.engagements;
  perform 1 from public.milestones; perform 1 from public.clients; perform 1 from public.coaching_agreements;
  perform 1 from public.development_goals; perform 1 from public.sessions; perform 1 from public.session_summaries;
  perform 1 from public.session_coach_notes; perform 1 from public.read_session_preparations();
  perform 1 from public.reflections; perform 1 from public.insights;
  perform id, client_id, session_id, date, text, due_label, status, completed_at, created_at, updated_at from public.commitments;
  perform 1 from public.documents; perform 1 from public.materials;
  perform client_id, granted_at, withdrawn_at from public.special_category_consents;
  perform 1 from public.read_commitment_client_notes();
  raise notice 'ok - every portal snapshot read succeeds for a coach';
end $$;
rollback;
