-- P1-01: the coach saves her own profile (src/app/api/portal/profile/route.ts).
-- Each case runs as the portal identity and rolls back.

-- A coach updates her own profile; the protected fields are kept.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_rows int;
  v_row public.coaches;
begin
  with u as (
    update public.coaches set name = 'Coach A2', title = 'Titel 2', credential = 'Cert 2', focus = 'Fokus 2'
    where id = 'a0000000-0000-4000-8000-00000000000a'
    returning 1
  ) select count(*) into v_rows from u;
  if v_rows <> 1 then raise exception 'FAIL own profile update touched % rows', v_rows; end if;

  select * into v_row from public.coaches where id = 'a0000000-0000-4000-8000-00000000000a';
  if (v_row.name, v_row.title, v_row.credential, v_row.focus) <> ('Coach A2', 'Titel 2', 'Cert 2', 'Fokus 2') then
    raise exception 'FAIL profile values not saved';
  end if;
  if v_row.email <> 'coach-a@example.invalid' or v_row.initials <> 'CA' then
    raise exception 'FAIL protected fields changed';
  end if;
  raise notice 'ok - coach updates own profile, email and initials preserved';
end $$;
rollback;

-- A coach cannot change another coach's profile.
begin;
select test_harness.act_as('coach_a');
do $$
declare v_rows int;
begin
  with u as (update public.coaches set name = 'kapad' where id = 'b0000000-0000-4000-8000-00000000000b' returning 1)
  select count(*) into v_rows from u;
  if v_rows <> 0 then raise exception 'FAIL coach A updated coach B (% rows)', v_rows; end if;
  raise notice 'ok - coach cannot update another coach''s profile';
end $$;
rollback;

-- A client cannot change any coach profile.
begin;
select test_harness.act_as('client_x');
do $$
declare v_rows int;
begin
  with u as (update public.coaches set name = 'kapad' returning 1) select count(*) into v_rows from u;
  if v_rows <> 0 then raise exception 'FAIL client updated a coach profile (% rows)', v_rows; end if;
  raise notice 'ok - client cannot update a coach profile';
end $$;
rollback;

-- Protected columns stay read-only, also for the owning coach.
begin;
select test_harness.act_as('coach_a');
do $$
begin
  update public.coaches set email = 'ny@example.invalid' where id = 'a0000000-0000-4000-8000-00000000000a';
  raise exception 'FAIL email was writable';
exception when insufficient_privilege then
  raise notice 'ok - coach email is read-only';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  update public.coaches set initials = 'XX' where id = 'a0000000-0000-4000-8000-00000000000a';
  raise exception 'FAIL initials were writable';
exception when insufficient_privilege then
  raise notice 'ok - coach initials are read-only';
end $$;
rollback;

begin;
select test_harness.act_as('coach_a');
do $$
begin
  update public.coaches set id = gen_random_uuid() where id = 'a0000000-0000-4000-8000-00000000000a';
  raise exception 'FAIL coach id was writable';
exception when insufficient_privilege then
  raise notice 'ok - coach id is read-only';
end $$;
rollback;

-- Anonymous callers have no access at all.
begin;
select test_harness.act_as('anon');
do $$
begin
  update public.coaches set name = 'anon';
  raise exception 'FAIL anon could update coaches';
exception when insufficient_privilege then
  raise notice 'ok - anon cannot update coaches';
end $$;
rollback;
