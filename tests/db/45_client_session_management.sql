-- CVB-CR-20261015-01: client details, safe email correction and manual
-- session registration (begin_coach_client_update,
-- update_coach_client_details, register_manual_coaching_session).
-- Synthetic fixtures from 10_fixtures.sql only. Each case runs as a portal
-- identity and rolls back.
--
-- Fixtures used: coach A owns X (portal account 11…, session 1 kommande
-- 2026-10-01 10:00/60), Z (account 22…, session 1 genomford) and V (no
-- account); coach B owns Y.

-- ------------------------------------------------------------ A. client details

-- 1. Coach edits the editable fields of a client without a portal account.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_plan jsonb;
  v_row public.clients;
begin
  v_plan := public.begin_coach_client_update('c0000000-0000-4000-8000-0000000000e4', 'Vera Ny', 'Ny roll', ' V2@Example.invalid ', '070-1', 'VN');
  if (v_plan ->> 'email_changed')::boolean is not true or v_plan ->> 'auth_user_id' is not null then
    raise exception 'FAIL begin plan for client without account: %', v_plan;
  end if;
  if v_plan ? 'auth_user_email' then raise exception 'FAIL begin exposes the account address'; end if;

  perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e4', 'Vera Ny', 'Ny roll', ' V2@Example.invalid ', '070-1', 'VN');
  select * into v_row from public.clients where id = 'c0000000-0000-4000-8000-0000000000e4';
  if (v_row.name, v_row.initials, v_row.role, v_row.email, v_row.phone) <> ('Vera Ny', 'VN', 'Ny roll', 'v2@example.invalid', '070-1') then
    raise exception 'FAIL client details not saved: %', row_to_json(v_row);
  end if;
  if v_row.engagement_id <> 'ea000000-0000-4000-8000-000000000001' or v_row.started_at <> '2026-01-01' then
    raise exception 'FAIL protected client fields changed';
  end if;
  raise notice 'ok - coach edits name, role, email and phone of her client';
end $$;
rollback;

-- 2. Name change on a linked client keeps the email and follows into the profile.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_profile public.profiles;
begin
  perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e1', 'Xena Ny', 'r', 'X@EXAMPLE.invalid', '', 'XN');
  if (select email from public.clients where id = 'c0000000-0000-4000-8000-0000000000e1') <> 'x@example.invalid' then
    raise exception 'FAIL email rewritten although only its case differed';
  end if;
  reset role;
  select * into v_profile from public.profiles where id = '11000000-0000-4000-8000-000000000011';
  if v_profile.name <> 'Xena Ny' or v_profile.email <> 'x@example.invalid' or v_profile.client_id <> 'c0000000-0000-4000-8000-0000000000e1' then
    raise exception 'FAIL profile after name change: %', row_to_json(v_profile);
  end if;
  raise notice 'ok - name change follows into the linked profile, email unchanged';
end $$;
rollback;

-- 3. Only the owning coach: another coach, a client and anon are refused.
begin;
select test_harness.act_as('coach_b');
do $$
begin
  perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e1', 'Kapad', 'r', 'x@example.invalid', '', 'KA');
  raise exception 'FAIL coach B edited coach A''s client';
exception when raise_exception then
  if sqlerrm <> 'CLIENT_NOT_FOUND' then raise; end if;
  raise notice 'ok - another coach cannot edit the client';
end $$;
rollback;

begin;
select test_harness.act_as('client_x');
do $$
begin
  perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e1', 'Kapad', 'r', 'x@example.invalid', '', 'KA');
  raise exception 'FAIL client ran the coach edit';
exception when raise_exception then
  if sqlerrm <> 'NOT_COACH' then raise; end if;
  raise notice 'ok - a client cannot run the coach edit';
end $$;
rollback;

do $$
begin
  if has_function_privilege('anon', 'public.update_coach_client_details(uuid, text, text, text, text, text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.begin_coach_client_update(uuid, text, text, text, text, text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.register_manual_coaching_session(uuid, date, text, text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.coach_client_details_check(uuid, text, text, text, text, text)', 'EXECUTE') then
    raise exception 'FAIL new functions are over-granted';
  end if;
  raise notice 'ok - anon cannot run the new functions and the shared check is internal';
end $$;

-- 4. Validation.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_case record;
begin
  for v_case in
    select * from (values
      ('', 'r', 'v@example.invalid', 'INVALID_NAME'),
      ('Vera', '', 'v@example.invalid', 'INVALID_ROLE'),
      ('Vera', 'r', 'inte-en-adress', 'INVALID_EMAIL'),
      ('Vera', 'r', 'a@b', 'INVALID_EMAIL')
    ) as t(name, role, email, code)
  loop
    begin
      perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e4', v_case.name, v_case.role, v_case.email, '', 'VE');
      raise exception 'FAIL accepted %', v_case;
    exception when raise_exception then
      if sqlerrm <> v_case.code then raise exception 'FAIL % raised %', v_case, sqlerrm; end if;
    end;
  end loop;
  raise notice 'ok - invalid name, role and email are refused';
end $$;
rollback;

-- 5. Duplicates and identity conflicts are refused, never repaired.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_email text;
begin
  foreach v_email in array array['z@example.invalid', 'Y@example.invalid', 'coach-a@example.invalid', 'coach-b@example.invalid'] loop
    begin
      perform public.begin_coach_client_update('c0000000-0000-4000-8000-0000000000e1', 'Klient X', 'r', v_email, '', 'KX');
      raise exception 'FAIL begin accepted %', v_email;
    exception when raise_exception then
      if sqlerrm <> 'EMAIL_IN_USE' then raise exception 'FAIL % raised %', v_email, sqlerrm; end if;
    end;
    begin
      perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e1', 'Klient X', 'r', v_email, '', 'KX');
      raise exception 'FAIL update accepted %', v_email;
    exception when raise_exception then
      if sqlerrm <> 'EMAIL_IN_USE' then raise exception 'FAIL % raised %', v_email, sqlerrm; end if;
    end;
  end loop;
  raise notice 'ok - addresses of other clients, accounts and coaches are refused';
end $$;
rollback;

-- An account outside the portal that already holds the address.
begin;
insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
values ('99000000-0000-4000-8000-000000000099', 'fri@example.invalid', '{}', '{}');
select test_harness.act_as('coach_a');
do $$
begin
  perform public.begin_coach_client_update('c0000000-0000-4000-8000-0000000000e4', 'Klient V', 'r', 'fri@example.invalid', '', 'KV');
  raise exception 'FAIL unlinked account address accepted';
exception when raise_exception then
  if sqlerrm <> 'EMAIL_IN_USE' then raise; end if;
  raise notice 'ok - an unlinked account''s address is refused';
end $$;
rollback;

-- An invitation being delivered blocks an address change.
begin;
insert into public.client_invitations (client_id, recipient_email, status, attempt_count, last_attempt_at)
values ('c0000000-0000-4000-8000-0000000000e4', 'v@example.invalid', 'pending', 1, now());
select test_harness.act_as('coach_a');
do $$
begin
  perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e4', 'Klient V', 'r', 'v-ny@example.invalid', '', 'KV');
  raise exception 'FAIL address changed during an invitation';
exception when raise_exception then
  if sqlerrm <> 'INVITATION_IN_PROGRESS' then raise; end if;
  raise notice 'ok - address change waits for an invitation in progress';
end $$;
rollback;

-- 6. Linked client: the account must carry the new address first.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_plan jsonb;
begin
  v_plan := public.begin_coach_client_update('c0000000-0000-4000-8000-0000000000e1', 'Klient X', 'r', 'x-ny@example.invalid', '', 'KX');
  if v_plan ->> 'auth_user_id' <> '11000000-0000-4000-8000-000000000011' or (v_plan ->> 'email_changed')::boolean is not true then
    raise exception 'FAIL begin plan for linked client: %', v_plan;
  end if;
  begin
    perform public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e1', 'Klient X', 'r', 'x-ny@example.invalid', '', 'KX');
    raise exception 'FAIL client address changed while the account kept the old one';
  exception when raise_exception then
    if sqlerrm <> 'AUTH_EMAIL_NOT_SYNCED' then raise; end if;
  end;
  if (select email from public.clients where id = 'c0000000-0000-4000-8000-0000000000e1') <> 'x@example.invalid' then
    raise exception 'FAIL client row changed after refusal';
  end if;
  raise notice 'ok - linked client address cannot diverge from the account';
end $$;
rollback;

-- 7. Linked client: after the account is re-addressed (Admin API, same id),
--    client row and profile follow; identity link and history are intact.
begin;
create temp table before_counts on commit drop as
select
  (select count(*) from public.sessions where client_id = 'c0000000-0000-4000-8000-0000000000e1') as sessions,
  (select count(*) from public.reflections where client_id = 'c0000000-0000-4000-8000-0000000000e1') as reflections,
  (select count(*) from public.commitments where client_id = 'c0000000-0000-4000-8000-0000000000e1') as commitments,
  (select count(*) from public.documents where owner_id = 'c0000000-0000-4000-8000-0000000000e1') as documents,
  (select count(*) from public.special_category_consents where client_id = 'c0000000-0000-4000-8000-0000000000e1') as consents;
grant select on before_counts to authenticated;
-- What auth.admin.updateUserById does: same row, new address.
update auth.users set email = 'x-ny@example.invalid' where id = '11000000-0000-4000-8000-000000000011';
select test_harness.act_as('coach_a');
select public.update_coach_client_details('c0000000-0000-4000-8000-0000000000e1', 'Klient X', 'r', 'X-NY@example.invalid', '', 'KX');
reset role;
do $$
declare
  v_profile public.profiles;
  v_before before_counts;
begin
  select * into v_profile from public.profiles where client_id = 'c0000000-0000-4000-8000-0000000000e1';
  if v_profile.id <> '11000000-0000-4000-8000-000000000011' or v_profile.email <> 'x-ny@example.invalid' or v_profile.role <> 'klient' then
    raise exception 'FAIL profile after email change: %', row_to_json(v_profile);
  end if;
  if (select email from public.clients where id = 'c0000000-0000-4000-8000-0000000000e1') <> 'x-ny@example.invalid' then
    raise exception 'FAIL client row not re-addressed';
  end if;
  if (select count(*) from public.profiles where client_id = 'c0000000-0000-4000-8000-0000000000e1') <> 1 then
    raise exception 'FAIL identity link duplicated';
  end if;

  select * into v_before from before_counts;
  if (v_before.sessions, v_before.reflections, v_before.commitments, v_before.documents, v_before.consents) is distinct from (
    (select count(*) from public.sessions where client_id = 'c0000000-0000-4000-8000-0000000000e1'),
    (select count(*) from public.reflections where client_id = 'c0000000-0000-4000-8000-0000000000e1'),
    (select count(*) from public.commitments where client_id = 'c0000000-0000-4000-8000-0000000000e1'),
    (select count(*) from public.documents where owner_id = 'c0000000-0000-4000-8000-0000000000e1'),
    (select count(*) from public.special_category_consents where client_id = 'c0000000-0000-4000-8000-0000000000e1')
  ) then
    raise exception 'FAIL client history changed';
  end if;
  raise notice 'ok - email correction keeps the same account, profile and history';
end $$;
-- The client still signs in as herself and sees her own data.
select test_harness.act_as('client_x');
do $$
begin
  if public.current_client_id() <> 'c0000000-0000-4000-8000-0000000000e1' then
    raise exception 'FAIL client identity no longer resolves';
  end if;
  if (select count(*) from public.sessions) <> 1 then
    raise exception 'FAIL client lost access to her sessions';
  end if;
  raise notice 'ok - the re-addressed client still resolves to her own data';
end $$;
-- An invitation now targets the corrected address without a mismatch.
reset role;
select test_harness.act_as('coach_a');
do $$
declare
  v_plan jsonb;
begin
  v_plan := public.begin_client_invitation('c0000000-0000-4000-8000-0000000000e1');
  if v_plan ->> 'recipient_email' <> 'x-ny@example.invalid' or v_plan ->> 'auth_user_id' <> '11000000-0000-4000-8000-000000000011' then
    raise exception 'FAIL invitation plan after correction: %', v_plan;
  end if;
  raise notice 'ok - invitation flow accepts the corrected address for the same account';
end $$;
rollback;

-- ------------------------------------------------------------ B. manual session

-- 8. A past session is recorded on the right client, in the existing model.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_id uuid;
  v_row public.sessions;
begin
  v_id := public.register_manual_coaching_session('c0000000-0000-4000-8000-0000000000e2', '2026-09-15', '09:00', '10:15');
  select * into v_row from public.sessions where id = v_id;
  if v_row.client_id <> 'c0000000-0000-4000-8000-0000000000e2'
     or v_row.date <> '2026-09-15' or v_row.time <> '09:00' or v_row.duration_minutes <> 75
     or v_row.status <> 'genomford' or v_row.number <> 2 then
    raise exception 'FAIL manual session row: %', row_to_json(v_row);
  end if;
  if v_row.client_focus <> '' or v_row.focus_written_at is not null then
    raise exception 'FAIL manual session carries content';
  end if;
  raise notice 'ok - manual session recorded with date, start, duration and status genomford';
end $$;
-- Visible in the coach's session history and to the client herself.
do $$
begin
  if (select count(*) from public.sessions where client_id = 'c0000000-0000-4000-8000-0000000000e2') <> 2 then
    raise exception 'FAIL coach does not see the manual session';
  end if;
  raise notice 'ok - manual session appears in the coach''s session history';
end $$;
reset role;
select test_harness.act_as('client_z');
do $$
begin
  if not exists (select 1 from public.sessions where date = '2026-09-15' and status = 'genomford') then
    raise exception 'FAIL client does not see her manual session';
  end if;
  raise notice 'ok - manual session follows existing client read access';
end $$;
reset role;
select test_harness.act_as('client_x');
do $$
begin
  if exists (select 1 from public.sessions where date = '2026-09-15') then
    raise exception 'FAIL another client sees the manual session';
  end if;
  raise notice 'ok - other clients do not see the manual session';
end $$;
rollback;

-- 9. Invalid intervals, future sessions and duplicates are refused.
begin;
select test_harness.act_as('coach_a');
do $$
declare
  v_case record;
  v_before int := (select count(*) from public.sessions);
begin
  for v_case in
    select * from (values
      ('2026-09-15'::date, '10:00', '10:00', 'INVALID_INTERVAL'),
      ('2026-09-15'::date, '11:00', '10:00', 'INVALID_INTERVAL'),
      ('2026-09-15'::date, '06:00', '14:30', 'INVALID_INTERVAL'),
      ('2026-09-15'::date, '9:00', '10:00', 'INVALID_TIME'),
      ('2026-09-15'::date, '24:00', '24:30', 'INVALID_TIME'),
      ((current_date + 2), '09:00', '10:00', 'SESSION_IN_FUTURE'),
      ('2026-10-01'::date, '10:30', '11:30', 'SESSION_OVERLAP'),
      ('2026-10-01'::date, '09:30', '10:01', 'SESSION_OVERLAP')
    ) as t(d, s, e, code)
  loop
    begin
      perform public.register_manual_coaching_session('c0000000-0000-4000-8000-0000000000e1', v_case.d, v_case.s, v_case.e);
      raise exception 'FAIL accepted %', v_case;
    exception when raise_exception then
      if sqlerrm <> v_case.code then raise exception 'FAIL % raised %', v_case, sqlerrm; end if;
    end;
  end loop;
  if (select count(*) from public.sessions) <> v_before then
    raise exception 'FAIL a refused registration left a row';
  end if;
  -- Adjacent to the existing 10:00–11:00 session is not an overlap.
  perform public.register_manual_coaching_session('c0000000-0000-4000-8000-0000000000e1', '2026-10-01', '11:00', '12:00');
  raise notice 'ok - invalid, future and overlapping sessions are refused';
end $$;
rollback;

-- 10. Only the owning coach records sessions.
begin;
select test_harness.act_as('coach_b');
do $$
begin
  perform public.register_manual_coaching_session('c0000000-0000-4000-8000-0000000000e1', '2026-09-15', '09:00', '10:00');
  raise exception 'FAIL coach B recorded a session for coach A''s client';
exception when raise_exception then
  if sqlerrm <> 'CLIENT_NOT_FOUND' then raise; end if;
  raise notice 'ok - another coach cannot record a session for the client';
end $$;
rollback;

begin;
select test_harness.act_as('client_x');
do $$
begin
  perform public.register_manual_coaching_session('c0000000-0000-4000-8000-0000000000e1', '2026-09-15', '09:00', '10:00');
  raise exception 'FAIL client recorded a session';
exception when raise_exception then
  if sqlerrm <> 'NOT_COACH' then raise; end if;
  raise notice 'ok - a client cannot record sessions';
end $$;
rollback;

-- 11. No booking, reservation, notification or invitation is created and no
--     existing session changes — nothing exists from which an email could go.
begin;
create temp table snapshot on commit drop as
select
  (select count(*) from public.session_booking_requests) as booking_requests,
  (select count(*) from public.public_booking_requests) as public_requests,
  (select count(*) from public.public_booking_notifications) as public_notifications,
  (select count(*) from public.client_invitations) as invitations,
  (select count(*) from public.contract_confirmation_notifications) as contract_notifications,
  (select count(*) from public.contract_withdrawal_notifications) as withdrawal_notifications,
  (select count(*) from public.clients) as clients,
  (select md5(string_agg(row_to_json(s)::text, '|' order by s.id)) from public.sessions s) as sessions_hash;
select test_harness.act_as('coach_a');
select public.register_manual_coaching_session('c0000000-0000-4000-8000-0000000000e1', '2026-09-20', '13:00', '14:00');
reset role;
do $$
declare
  v snapshot;
begin
  select * into v from snapshot;
  if (v.booking_requests, v.public_requests, v.public_notifications, v.invitations, v.contract_notifications, v.withdrawal_notifications, v.clients)
     is distinct from (
       (select count(*) from public.session_booking_requests),
       (select count(*) from public.public_booking_requests),
       (select count(*) from public.public_booking_notifications),
       (select count(*) from public.client_invitations),
       (select count(*) from public.contract_confirmation_notifications),
       (select count(*) from public.contract_withdrawal_notifications),
       (select count(*) from public.clients)) then
    raise exception 'FAIL manual session created booking, notification, invitation or client rows';
  end if;
  if v.sessions_hash is distinct from (
    select md5(string_agg(row_to_json(s)::text, '|' order by s.id)) from public.sessions s where s.date <> '2026-09-20'
  ) then
    raise exception 'FAIL an existing session changed';
  end if;
  raise notice 'ok - manual session creates no booking, notification or invitation and leaves other sessions unchanged';
end $$;
rollback;

-- 12. The booking-based flow is unchanged and numbers after a manual session.
begin;
insert into public.session_booking_requests (id, client_id, requested_by_role, date, time, duration_minutes, status)
values ('5c000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-0000000000e2', 'klient', date_trunc('week', current_date + 14)::date + 1, '15:00', 60, 'pending');
select test_harness.act_as('coach_a');
do $$
declare
  v_manual uuid;
  v_booked uuid;
  v_row public.sessions;
begin
  v_manual := public.register_manual_coaching_session('c0000000-0000-4000-8000-0000000000e2', '2026-09-15', '09:00', '10:00');
  v_booked := public.accept_session_booking('5c000000-0000-4000-8000-000000000001');
  select * into v_row from public.sessions where id = v_booked;
  if v_row.status <> 'kommande' or v_row.number <> 3 or v_row.duration_minutes <> 60 or v_row.time <> '15:00' then
    raise exception 'FAIL booked session after manual one: %', row_to_json(v_row);
  end if;
  if (select session_id from public.session_booking_requests where id = '5c000000-0000-4000-8000-000000000001') <> v_booked then
    raise exception 'FAIL booking not linked to its session';
  end if;
  raise notice 'ok - booking-based sessions work unchanged alongside manual sessions';
end $$;
rollback;
