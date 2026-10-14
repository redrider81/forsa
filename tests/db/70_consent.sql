-- Article 9 consent boundary in the database (20261001110000). Consent
-- timelines are in 10_fixtures.sql. A database read error in the
-- application is covered by tests/consent-failure.test.ts.

-- The harness may switch identity again inside one transaction.
grant usage on schema test_harness to anon, authenticated;
grant execute on function test_harness.act_as(text) to anon, authenticated;

-- The coach reads client-authored content only under an active consent and
-- only if it was written inside a consent window.
begin;
select test_harness.act_as('coach_a');
do $$
declare v_seen text;
begin
  select string_agg(text, ',' order by text) into v_seen from public.reflections;
  if v_seen is distinct from 'V inom andra,V inom forsta,X inom samtycke' then
    raise exception 'FAIL coach sees reflections: %', v_seen;
  end if;
  raise notice 'ok - valid consent: coach sees only reflections written inside a window';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  if exists (select 1 from public.reflections where client_id = 'c0000000-0000-4000-8000-0000000000e2')
     or exists (select 1 from public.read_commitment_client_notes() n
                join public.commitments c on c.id = n.commitment_id
                where c.client_id = 'c0000000-0000-4000-8000-0000000000e2') then
    raise exception 'FAIL content of a client without consent is visible';
  end if;
  raise notice 'ok - no consent: nothing client-authored reaches the coach';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  if exists (select 1 from public.reflections where client_id = 'c0000000-0000-4000-8000-0000000000e3') then
    raise exception 'FAIL content of a withdrawn consent is visible';
  end if;
  raise notice 'ok - withdrawn consent: also content written while it was valid is hidden';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  if exists (select 1 from public.reflections where text = 'V i luckan') then
    raise exception 'FAIL content written between withdrawal and a new consent is visible';
  end if;
  raise notice 'ok - a later consent does not open content written after a withdrawal';
end $$;
rollback;

-- Withdrawing right now closes everything at once, also the client note.
begin;
select test_harness.act_as('client_x');
select * from public.withdraw_special_category_consent();
select test_harness.act_as('coach_a');
do $$
begin
  if exists (select 1 from public.reflections where client_id = 'c0000000-0000-4000-8000-0000000000e1')
     or exists (select 1 from public.read_commitment_client_notes()) then
    raise exception 'FAIL content still visible after withdrawal';
  end if;
  raise notice 'ok - withdrawal takes effect immediately for reflections and notes';
end $$;
rollback;

-- The client always keeps access to her own content.
begin;
select test_harness.act_as('client_w');
do $$
begin
  if (select count(*) from public.reflections) <> 2 then
    raise exception 'FAIL client lost access to her own reflections';
  end if;
  raise notice 'ok - client keeps reading her own content after withdrawal';
end $$;
rollback;

-- Unauthorised attempts.
begin;
select test_harness.act_as('coach_a');
do $$
begin
  perform public.grant_special_category_consent('2026-10-01');
  raise exception 'FAIL coach granted consent on behalf of a client';
exception when raise_exception then
  if sqlerrm <> 'NOT_AUTHORIZED' then raise; end if;
  raise notice 'ok - a coach cannot grant consent for a client';
end $$;
rollback;

begin;
select test_harness.act_as('coach_b');
do $$
begin
  if exists (select 1 from public.special_category_consents)
     or exists (select 1 from public.reflections)
     or public.special_category_coach_may_read('c0000000-0000-4000-8000-0000000000e1', '2026-09-15T00:00:00Z') then
    raise exception 'FAIL another coach reaches consent state or content';
  end if;
  raise notice 'ok - another coach sees neither consent state nor content';
end $$;
rollback;

begin;
select test_harness.act_as('client_z');
do $$
begin
  if exists (select 1 from public.special_category_consents where client_id <> 'c0000000-0000-4000-8000-0000000000e2') then
    raise exception 'FAIL client reads another client''s consent';
  end if;
  raise notice 'ok - client reads only her own consent state';
end $$;
rollback;

begin;
select test_harness.act_as('anon');
do $$
begin
  perform 1 from public.special_category_consents;
  raise exception 'FAIL anon read consents';
exception when insufficient_privilege then
  raise notice 'ok - anon cannot read consent state';
end $$;
rollback;
