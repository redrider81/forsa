-- CVB-CR-20261021-01, part B: the client's own profile edit
-- (begin_own_client_profile_update, update_own_client_profile).
-- Synthetic fixtures from 10_fixtures.sql only. Each case runs as a portal
-- identity and rolls back.
--
-- Fixtures used: client X (account 11…, coach A), client Z (account 22…),
-- client Y (coach B, no account), coaches A and B.

-- 1. Name, role and phone without an address change; the profile name follows.
begin;
select test_harness.act_as('client_x');
do $$
declare
  v_plan jsonb;
begin
  v_plan := public.begin_own_client_profile_update('Xena Ny', 'Ny roll', 'X@EXAMPLE.invalid', '070-1');
  if (v_plan ->> 'email_changed')::boolean is not false
     or v_plan ->> 'auth_user_id' <> '11000000-0000-4000-8000-000000000011' then
    raise exception 'FAIL begin plan without address change: %', v_plan;
  end if;
  if v_plan ? 'auth_user_email' then raise exception 'FAIL begin exposes the account address'; end if;
  perform public.update_own_client_profile('Xena Ny', 'Ny roll', 'X@EXAMPLE.invalid', '070-1');
  raise notice 'ok - client plans a profile edit without an address change';
end $$;
reset role;
do $$
declare
  v_client public.clients;
  v_profile public.profiles;
begin
  select * into v_client from public.clients where id = 'c0000000-0000-4000-8000-0000000000e1';
  select * into v_profile from public.profiles where id = '11000000-0000-4000-8000-000000000011';
  if (v_client.name, v_client.role, v_client.email, v_client.phone) <> ('Xena Ny', 'Ny roll', 'x@example.invalid', '070-1') then
    raise exception 'FAIL client row: %', row_to_json(v_client);
  end if;
  if v_profile.name <> 'Xena Ny' or v_profile.email <> 'x@example.invalid'
     or v_profile.client_id <> 'c0000000-0000-4000-8000-0000000000e1' then
    raise exception 'FAIL profile: %', row_to_json(v_profile);
  end if;
  raise notice 'ok - name, role and phone saved; profile name follows, email unchanged';
end $$;
rollback;

-- 2. An address change is refused while the account keeps the old address.
begin;
select test_harness.act_as('client_x');
do $$
declare
  v_plan jsonb;
begin
  v_plan := public.begin_own_client_profile_update('Klient X', 'r', 'x-ny@example.invalid', '');
  if (v_plan ->> 'email_changed')::boolean is not true then
    raise exception 'FAIL begin plan for an address change: %', v_plan;
  end if;
  begin
    perform public.update_own_client_profile('Klient X', 'r', 'x-ny@example.invalid', '');
    raise exception 'FAIL client address changed while the account kept the old one';
  exception when raise_exception then
    if sqlerrm <> 'AUTH_EMAIL_NOT_SYNCED' then raise; end if;
  end;
  if (select email from public.clients where id = 'c0000000-0000-4000-8000-0000000000e1') <> 'x@example.invalid' then
    raise exception 'FAIL client row changed after refusal';
  end if;
  raise notice 'ok - own address cannot diverge from the sign-in account';
end $$;
rollback;

-- 3. After the account is re-addressed (Admin API, same id), the client row
--    and profile follow; the identity link is intact.
begin;
update auth.users set email = 'x-ny@example.invalid' where id = '11000000-0000-4000-8000-000000000011';
select test_harness.act_as('client_x');
select public.update_own_client_profile('Klient X', 'r', ' X-NY@example.invalid ', '');
reset role;
do $$
declare
  v_profile public.profiles;
begin
  if (select email from public.clients where id = 'c0000000-0000-4000-8000-0000000000e1') <> 'x-ny@example.invalid' then
    raise exception 'FAIL client row not re-addressed';
  end if;
  select * into v_profile from public.profiles where id = '11000000-0000-4000-8000-000000000011';
  if v_profile.email <> 'x-ny@example.invalid' or v_profile.client_id <> 'c0000000-0000-4000-8000-0000000000e1'
     or v_profile.role::text <> 'klient' then
    raise exception 'FAIL profile after address change: %', row_to_json(v_profile);
  end if;
  raise notice 'ok - client row and profile follow the re-addressed account';
end $$;
rollback;

-- 4. Addresses already in use are refused: another account, another client, a coach.
begin;
select test_harness.act_as('client_x');
do $$
declare
  v_email text;
begin
  foreach v_email in array array['z@example.invalid', 'Y@example.invalid', 'coach-a@example.invalid'] loop
    begin
      perform public.begin_own_client_profile_update('Klient X', 'r', v_email, '');
      raise exception 'FAIL begin accepted %', v_email;
    exception when raise_exception then
      if sqlerrm <> 'EMAIL_IN_USE' then raise exception 'FAIL % raised %', v_email, sqlerrm; end if;
    end;
    begin
      perform public.update_own_client_profile('Klient X', 'r', v_email, '');
      raise exception 'FAIL update accepted %', v_email;
    exception when raise_exception then
      if sqlerrm <> 'EMAIL_IN_USE' then raise exception 'FAIL % raised %', v_email, sqlerrm; end if;
    end;
  end loop;
  raise notice 'ok - addresses used by another account, client or coach are refused';
end $$;
rollback;

-- 5. Validation is enforced in the database.
begin;
select test_harness.act_as('client_x');
do $$
begin
  begin
    perform public.update_own_client_profile('Klient X', 'r', 'inte-en-adress', '');
    raise exception 'FAIL invalid address accepted';
  exception when raise_exception then
    if sqlerrm <> 'INVALID_EMAIL' then raise; end if;
  end;
  begin
    perform public.update_own_client_profile('  ', 'r', 'x@example.invalid', '');
    raise exception 'FAIL empty name accepted';
  exception when raise_exception then
    if sqlerrm <> 'INVALID_NAME' then raise; end if;
  end;
  begin
    perform public.update_own_client_profile('Klient X', 'r', 'x@example.invalid', repeat('1', 41));
    raise exception 'FAIL long phone accepted';
  exception when raise_exception then
    if sqlerrm <> 'INVALID_PHONE' then raise; end if;
  end;
  raise notice 'ok - name, email and phone are validated in the database';
end $$;
rollback;

-- 6. Only a client session: a coach and anon are refused; the shared check is internal.
begin;
select test_harness.act_as('coach_a');
do $$
begin
  perform public.begin_own_client_profile_update('Kapad', 'r', 'x@example.invalid', '');
  raise exception 'FAIL coach ran the client profile edit';
exception when raise_exception then
  if sqlerrm <> 'NOT_CLIENT' then raise; end if;
  raise notice 'ok - a coach cannot run the client profile edit';
end $$;
rollback;

begin;
select test_harness.act_as('anon');
do $$
begin
  perform public.update_own_client_profile('Kapad', 'r', 'x@example.invalid', '');
  raise exception 'FAIL anon ran the client profile edit';
exception when insufficient_privilege then
  raise notice 'ok - anon cannot run the client profile edit';
end $$;
rollback;

do $$
begin
  if has_function_privilege('authenticated', 'public.own_client_profile_check(text, text, text, text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.own_client_profile_check(text, text, text, text)', 'EXECUTE') then
    raise exception 'FAIL own_client_profile_check is callable from the portal';
  end if;
  raise notice 'ok - own_client_profile_check is internal';
end $$;

-- 7. A client edits only her own row: client Z's edit never touches X.
begin;
select test_harness.act_as('client_z');
select public.update_own_client_profile('Zelda Ny', 'r', 'z@example.invalid', '');
reset role;
do $$
begin
  if (select name from public.clients where id = 'c0000000-0000-4000-8000-0000000000e1') <> 'Klient X' then
    raise exception 'FAIL another client''s row changed';
  end if;
  if (select name from public.clients where id = 'c0000000-0000-4000-8000-0000000000e2') <> 'Zelda Ny' then
    raise exception 'FAIL own row not saved';
  end if;
  raise notice 'ok - a client edits only her own row';
end $$;
rollback;
