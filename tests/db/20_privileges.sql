-- Every database operation the application performs, checked against the
-- privileges the migrations actually grant (production default privileges,
-- see 00_environment.sql). A missing GRANT fails here instead of surfacing
-- as 42501 in production. Keep this list in step with the code: a new
-- .from()/.rpc() call needs a line here.

-- ------------------------------------------------ direct table operations
do $$
declare
  v_missing text;
begin
  with ops(src, tbl, op, cols) as (values
    ('session.ts / users.ts / aktivera', 'profiles', 'SELECT', null),
    ('portal/profile/route.ts', 'coaches', 'UPDATE', 'name,title,credential,focus'),
    ('repository.ts', 'coaches', 'SELECT', null),
    ('repository.ts', 'organisations', 'SELECT', null),
    ('repository.ts', 'engagements', 'SELECT', null),
    ('repository.ts', 'milestones', 'SELECT', null),
    ('repository.ts', 'clients', 'SELECT', null),
    ('repository.ts', 'coaching_agreements', 'SELECT', null),
    ('portal/agreement/route.ts', 'coaching_agreements', 'UPDATE', 'agreed_at,purpose,scope,cadence,confidentiality,sponsor_sharing,ethics,client_responsibility'),
    ('repository.ts', 'development_goals', 'SELECT', null),
    ('repository.ts', 'sessions', 'SELECT', null),
    ('mote/agreement/route.ts', 'sessions', 'UPDATE', 'client_focus,desired_outcome'),
    ('repository.ts', 'session_summaries', 'SELECT', null),
    ('repository.ts', 'session_coach_notes', 'SELECT', null),
    ('mote/notes/route.ts (upsert)', 'session_coach_notes', 'INSERT', 'session_id,coach_id,notes,updated_at'),
    ('mote/notes/route.ts (upsert)', 'session_coach_notes', 'UPDATE', 'session_id,coach_id,notes,updated_at'),
    ('repository.ts', 'reflections', 'SELECT', null),
    ('klient/reflektion/route.ts', 'reflections', 'INSERT', 'client_id,date,prompt,text'),
    ('klient/reflektion/route.ts', 'reflections', 'DELETE', null),
    ('repository.ts', 'insights', 'SELECT', null),
    ('repository.ts', 'commitments', 'SELECT', 'id,client_id,session_id,date,text,due_label,status,completed_at,created_at,updated_at'),
    ('repository.ts', 'documents', 'SELECT', null),
    ('portal/document/route.ts', 'documents', 'INSERT', 'owner_type,owner_id,title,kind,date,description,visibility,uploaded_by_coach_id'),
    ('coach-document-files.ts', 'documents', 'UPDATE', 'storage_path,file_name,mime_type,size_bytes'),
    ('portal/document/route.ts', 'documents', 'DELETE', null),
    ('repository.ts', 'materials', 'SELECT', null),
    ('klient/material/route.ts', 'materials', 'INSERT', 'owner_client_id,created_by_role,created_by_id,title,file_name,mime_type,size_bytes,category,note_text,sharing_level,source,link_type,linked_session_id,linked_commitment_id,comment'),
    ('klient/material/route.ts + client-material-files.ts', 'materials', 'UPDATE', 'updated_at,title,category,comment,sharing_level,note_text,link_type,linked_session_id,linked_commitment_id,storage_path'),
    ('klient/material/route.ts', 'materials', 'DELETE', null),
    ('repository.ts', 'special_category_consents', 'SELECT', null),
    ('special-category-consent.ts', 'special_category_erasure_requests', 'SELECT', null),
    ('booking.ts', 'session_booking_requests', 'SELECT', null),
    ('portal|klient/booking/route.ts', 'session_booking_requests', 'INSERT', 'client_id,requested_by_role,date,time,duration_minutes,location,message'),
    ('availability.ts', 'coach_availability_rules', 'SELECT', null),
    ('availability.ts', 'coach_availability_rules', 'INSERT', 'coach_id,weekday,start_time,end_time'),
    ('availability.ts', 'coach_availability_rules', 'DELETE', null),
    ('availability.ts', 'coach_availability_exceptions', 'SELECT', null),
    ('availability.ts', 'coach_availability_exceptions', 'DELETE', null),
    ('availability.ts', 'coach_booking_settings', 'SELECT', null),
    ('availability.ts', 'coach_booking_settings', 'UPDATE', 'updated_at,meeting_duration_minutes,buffer_minutes,minimum_notice_hours,booking_horizon_days,public_booking_enabled'),
    ('availability.ts', 'public_booking_requests', 'SELECT', null),
    ('booking-notifications.ts', 'public_booking_notifications', 'SELECT', null),
    ('contracts.ts', 'contract_templates', 'SELECT', null),
    ('contracts.ts', 'contract_templates', 'INSERT', 'coach_id,name,title,content'),
    ('contracts.ts', 'contract_templates', 'UPDATE', 'updated_at,name,title,content'),
    ('contracts.ts', 'contract_templates', 'DELETE', null),
    ('contracts.ts', 'contracts', 'SELECT', null),
    ('contracts.ts', 'contracts', 'INSERT', 'coach_id,client_id,engagement_id,template_id,title,content,price_amount,currency,payment_terms,counterparty_type'),
    ('contracts.ts', 'contracts', 'UPDATE', 'updated_at,title,content,engagement_id,price_amount,currency,payment_terms'),
    ('contracts.ts', 'contract_signatures', 'SELECT', null),
    ('contract-confirmation.ts', 'contract_confirmation_notifications', 'SELECT', null),
    ('contract-withdrawal.ts', 'contract_withdrawals', 'SELECT', null),
    ('contract-withdrawal.ts', 'contract_withdrawal_notifications', 'SELECT', null)
  )
  select string_agg(format('%s %s(%s) [%s]', op, tbl, coalesce(cols, '*'), src), '; ')
  into v_missing
  from ops
  where not case
    when cols is null then has_table_privilege('authenticated', 'public.' || tbl, op)
    else (select bool_and(has_column_privilege('authenticated', 'public.' || tbl, c, op))
          from unnest(string_to_array(cols, ',')) c)
  end;

  if v_missing is not null then
    raise exception 'FAIL authenticated lacks privileges for: %', v_missing;
  end if;
  raise notice 'ok - authenticated holds every table privilege the application uses';
end $$;

-- ------------------------------------------------------------ RPC calls
do $$
declare
  v_missing text;
begin
  select string_agg(f, ', ') into v_missing
  from unnest(array[
    'mark_own_client_invitation_activated', 'accept_session_booking', 'decline_session_booking',
    'cancel_session_booking', 'create_client_bundle', 'complete_coaching_session',
    'upsert_coach_meeting_exploration', 'approve_session_summary', 'save_own_session_preparation',
    'update_own_client_profile', 'update_own_commitment_status', 'create_public_booking_request',
    'get_public_booking_slots', 'get_public_booking_status', 'end_coach_client', 'reactivate_coach_client',
    'delete_coach_client', 'grant_special_category_consent', 'withdraw_special_category_consent',
    'request_special_category_erasure', 'erase_special_category_content', 'count_client_private_content',
    'read_session_preparations', 'read_commitment_client_notes', 'replace_coach_availability_exception',
    'respond_public_booking_request', 'record_public_booking_notification_result',
    'set_contract_counterparty_type', 'send_contract_for_signature', 'sign_contract_as_client',
    'sign_contract_as_coach', 'begin_client_invitation', 'record_client_invitation_result',
    'client_portal_access', 'exercise_contract_withdrawal', 'record_contract_withdrawal_notification_result',
    'record_contract_confirmation_result', 'begin_coach_client_update', 'update_coach_client_details',
    'register_manual_coaching_session', 'begin_own_client_profile_update'
  ]) f
  where not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = f and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  );
  if v_missing is not null then
    raise exception 'FAIL authenticated cannot execute: %', v_missing;
  end if;
  raise notice 'ok - authenticated can execute every RPC the application calls';
end $$;

do $$
begin
  if not has_function_privilege('service_role', 'public.client_recovery_target(text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.client_recovery_target(text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.client_recovery_target(text)', 'EXECUTE') then
    raise exception 'FAIL client_recovery_target must be executable by service_role only';
  end if;
  raise notice 'ok - client_recovery_target is service_role only';
end $$;

-- ------------------------------------------------------ anon is denied
do $$
declare
  v_open text;
begin
  select string_agg(c.relname || ':' || op, ', ') into v_open
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) op
  where n.nspname = 'public' and c.relkind = 'r' and has_table_privilege('anon', c.oid, op);
  if v_open is not null then
    raise exception 'FAIL anon holds table privileges: %', v_open;
  end if;
  raise notice 'ok - anon holds no data privilege on any public table';
end $$;

do $$
declare
  v_open text;
begin
  select string_agg(p.proname, ', ' order by p.proname) into v_open
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prorettype not in ('trigger'::regtype, 'event_trigger'::regtype)
    and has_function_privilege('anon', p.oid, 'EXECUTE')
    and p.proname not in (
      'create_public_booking_request', 'get_public_booking_slots',
      'get_public_booking_status', 'record_public_booking_notification_result'
    );
  if v_open is not null then
    raise exception 'FAIL anon can execute non-public functions: %', v_open;
  end if;
  raise notice 'ok - anon can execute only the public booking functions';
end $$;
