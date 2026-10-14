-- CVB Base DB integration tests — harness and synthetic fixtures (runs as
-- postgres, after the migrations). Only invented data; nothing here is
-- copied from production.
--
-- Coach A owns clients X, Z, W and V; coach B owns client Y. X, Z and W have
-- portal accounts. Consent timelines (special_category_consents):
--   X  granted 2026-09-01, active
--   Z  never consented
--   W  granted 2026-09-01, withdrawn 2026-09-20
--   V  granted 2026-09-01, withdrawn 2026-09-10, granted again 2026-09-20

create schema test_harness;

-- Switches the rest of the transaction to a portal identity exactly as
-- PostgREST does: the database role plus the JWT claims auth.uid() reads.
-- Never service_role.
create function test_harness.act_as(p_identity text)
returns void
language plpgsql
as $$
declare
  v_sub text := case p_identity
    when 'coach_a' then 'aa000000-0000-4000-8000-0000000000aa'
    when 'coach_b' then 'bb000000-0000-4000-8000-0000000000bb'
    when 'client_x' then '11000000-0000-4000-8000-000000000011'
    when 'client_z' then '22000000-0000-4000-8000-000000000022'
    when 'client_w' then '33000000-0000-4000-8000-000000000033'
    when 'anon' then ''
  end;
begin
  if v_sub is null then
    raise exception 'unknown identity %', p_identity;
  end if;
  perform set_config('request.jwt.claim.sub', v_sub, true);
  perform set_config(
    'request.jwt.claims',
    case when v_sub = '' then '{"role":"anon"}'
         else json_build_object('sub', v_sub, 'role', 'authenticated')::text end,
    true
  );
  perform set_config('role', case when v_sub = '' then 'anon' else 'authenticated' end, true);
end;
$$;

insert into public.coaches (id, name, title, initials, email, credential, focus) values
  ('a0000000-0000-4000-8000-00000000000a', 'Coach A', 'Titel A', 'CA', 'coach-a@example.invalid', 'Cert A', 'Fokus A'),
  ('b0000000-0000-4000-8000-00000000000b', 'Coach B', 'Titel B', 'CB', 'coach-b@example.invalid', 'Cert B', 'Fokus B');

insert into public.organisations (id, name, size_label, industry, location) values
  ('0a000000-0000-4000-8000-000000000001', 'Org A', 's', 'i', 'l'),
  ('0b000000-0000-4000-8000-000000000001', 'Org B', 's', 'i', 'l');

insert into public.engagements (id, organisation_id, coach_id, title, kind, kind_label, purpose, scope_note, period_label, start_date, end_date, status, sponsor_reporting) values
  ('ea000000-0000-4000-8000-000000000001', '0a000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000a', 'EA', 'individuell', 'k', 'p', 's', 'p', '2026-01-01', '2026-12-31', 'pagaende', 'r'),
  ('eb000000-0000-4000-8000-000000000001', '0b000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-00000000000b', 'EB', 'individuell', 'k', 'p', 's', 'p', '2026-01-01', '2026-12-31', 'pagaende', 'r');

insert into public.clients (id, engagement_id, organisation_id, name, initials, role, email, started_at) values
  ('c0000000-0000-4000-8000-0000000000e1', 'ea000000-0000-4000-8000-000000000001', '0a000000-0000-4000-8000-000000000001', 'Klient X', 'KX', 'r', 'x@example.invalid', '2026-01-01'),
  ('c0000000-0000-4000-8000-0000000000e2', 'ea000000-0000-4000-8000-000000000001', '0a000000-0000-4000-8000-000000000001', 'Klient Z', 'KZ', 'r', 'z@example.invalid', '2026-01-01'),
  ('c0000000-0000-4000-8000-0000000000e3', 'ea000000-0000-4000-8000-000000000001', '0a000000-0000-4000-8000-000000000001', 'Klient W', 'KW', 'r', 'w@example.invalid', '2026-01-01'),
  ('c0000000-0000-4000-8000-0000000000e4', 'ea000000-0000-4000-8000-000000000001', '0a000000-0000-4000-8000-000000000001', 'Klient V', 'KV', 'r', 'v@example.invalid', '2026-01-01'),
  ('c0000000-0000-4000-8000-0000000000f1', 'eb000000-0000-4000-8000-000000000001', '0b000000-0000-4000-8000-000000000001', 'Klient Y', 'KY', 'r', 'y@example.invalid', '2026-01-01');

insert into public.sessions (id, client_id, number, date, time, duration_minutes, status, client_focus, desired_outcome, location) values
  ('50000000-0000-4000-8000-0000000000e1', 'c0000000-0000-4000-8000-0000000000e1', 1, '2026-10-01', '10:00', 60, 'kommande', 'Fokus X', 'Utfall X', 'Plats'),
  ('50000000-0000-4000-8000-0000000000e2', 'c0000000-0000-4000-8000-0000000000e2', 1, '2026-10-01', '11:00', 60, 'genomford', 'Fokus Z', 'Utfall Z', 'Plats'),
  ('50000000-0000-4000-8000-0000000000f1', 'c0000000-0000-4000-8000-0000000000f1', 1, '2026-10-01', '10:00', 60, 'kommande', 'Fokus Y', 'Utfall Y', 'Plats');

insert into public.session_coach_notes (session_id, coach_id, notes) values
  ('50000000-0000-4000-8000-0000000000e1', 'a0000000-0000-4000-8000-00000000000a', 'PRIVAT COACHANTECKNING');

insert into public.documents (owner_type, owner_id, title, kind, date, visibility) values
  ('klient', 'c0000000-0000-4000-8000-0000000000e1', 'intern', 'k', '2026-10-01', 'coach'),
  ('klient', 'c0000000-0000-4000-8000-0000000000e1', 'delad', 'k', '2026-10-01', 'coach_klient');

insert into public.coach_booking_settings (coach_id, public_slug) values
  ('a0000000-0000-4000-8000-00000000000a', 'coach-a'),
  ('b0000000-0000-4000-8000-00000000000b', 'coach-b');

-- Portal accounts; handle_new_auth_user links the profiles from app metadata.
insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data) values
  ('aa000000-0000-4000-8000-0000000000aa', 'coach-a@example.invalid', '{"portal_role":"coach","portal_subject_id":"a0000000-0000-4000-8000-00000000000a"}', '{}'),
  ('bb000000-0000-4000-8000-0000000000bb', 'coach-b@example.invalid', '{"portal_role":"coach","portal_subject_id":"b0000000-0000-4000-8000-00000000000b"}', '{}'),
  ('11000000-0000-4000-8000-000000000011', 'x@example.invalid', '{"portal_role":"klient","portal_subject_id":"c0000000-0000-4000-8000-0000000000e1"}', '{}'),
  ('22000000-0000-4000-8000-000000000022', 'z@example.invalid', '{"portal_role":"klient","portal_subject_id":"c0000000-0000-4000-8000-0000000000e2"}', '{}'),
  ('33000000-0000-4000-8000-000000000033', 'w@example.invalid', '{"portal_role":"klient","portal_subject_id":"c0000000-0000-4000-8000-0000000000e3"}', '{}');

insert into public.special_category_consents (client_id, consent_version, granted_at, granted_by_auth_user_id, withdrawn_at, withdrawn_by_auth_user_id) values
  ('c0000000-0000-4000-8000-0000000000e1', '2026-10-01', '2026-09-01T00:00:00Z', '11000000-0000-4000-8000-000000000011', null, null),
  ('c0000000-0000-4000-8000-0000000000e3', '2026-10-01', '2026-09-01T00:00:00Z', '33000000-0000-4000-8000-000000000033', '2026-09-20T00:00:00Z', '33000000-0000-4000-8000-000000000033'),
  ('c0000000-0000-4000-8000-0000000000e4', '2026-10-01', '2026-09-01T00:00:00Z', 'aa000000-0000-4000-8000-0000000000aa', '2026-09-10T00:00:00Z', 'aa000000-0000-4000-8000-0000000000aa'),
  ('c0000000-0000-4000-8000-0000000000e4', '2026-10-01', '2026-09-20T00:00:00Z', 'aa000000-0000-4000-8000-0000000000aa', null, null);

-- Client-authored reflections; the text names the case.
insert into public.reflections (client_id, date, text, created_at) values
  ('c0000000-0000-4000-8000-0000000000e1', '2026-08-15', 'X fore samtycke', '2026-08-15T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e1', '2026-09-15', 'X inom samtycke', '2026-09-15T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e2', '2026-10-01', 'Z utan samtycke', '2026-10-01T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e3', '2026-09-10', 'W inom aterkallat', '2026-09-10T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e3', '2026-09-25', 'W efter aterkallat', '2026-09-25T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e4', '2026-09-05', 'V inom forsta', '2026-09-05T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e4', '2026-09-15', 'V i luckan', '2026-09-15T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e4', '2026-09-25', 'V inom andra', '2026-09-25T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000f1', '2026-10-01', 'Y hos coach B', '2026-10-01T00:00:00Z');

-- Commitments with client notes; updated_at is the note's timestamp.
insert into public.commitments (client_id, session_id, date, text, status, client_note, updated_at) values
  ('c0000000-0000-4000-8000-0000000000e1', '50000000-0000-4000-8000-0000000000e1', '2026-09-15', 'X atagande', 'oppet', 'X anteckning', '2026-09-15T00:00:00Z'),
  ('c0000000-0000-4000-8000-0000000000e2', '50000000-0000-4000-8000-0000000000e2', '2026-10-01', 'Z atagande', 'oppet', 'Z anteckning', '2026-10-01T00:00:00Z');
