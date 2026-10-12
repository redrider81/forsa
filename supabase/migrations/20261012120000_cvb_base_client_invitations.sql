-- CVB Base — secure client onboarding: trusted identity linkage + invitations.
--
-- 1. handle_new_auth_user no longer reads portal_role / portal_subject_id
--    from raw_user_meta_data. That column is written by whoever calls
--    /auth/v1/signup and could link a self-registered account to an
--    existing client. The link now comes only from raw_app_meta_data, which
--    only the service-role Admin API can set. The subject is validated
--    before the profile is written; an invalid link fails the account
--    creation instead of leaving a half-linked account behind.
--
--    Supabase Auth (verified against GoTrue v2.195.0) inserts the auth.users
--    row first and writes admin-supplied app_metadata with an UPDATE in the
--    same transaction, so the trigger also fires on updates of
--    raw_app_meta_data. It only ever creates a missing profile: an account
--    that already has a profile is never re-linked, whatever its metadata
--    later says, so existing accounts and profiles are untouched.
--
-- 2. client_invitations: one row per client (the current invitation), with
--    the same outbox semantics as the contract and booking ledgers. Rows
--    hold delivery state only — never a token, a link or a password.
--    activated_at is written only by the activated client's own session,
--    after the password has been set, so an account that merely exists is
--    never presented as activated.
--
-- 3. Coach RPCs. begin_client_invitation decides, under a row lock on the
--    client, whether the invitation may proceed and against which identity;
--    it refuses every conflicting identity instead of repairing it.
--    record_client_invitation_result closes a pending attempt.
--    client_portal_access reports the state shown to Carolina. One client
--    RPC, mark_own_client_invitation_activated, records activation.
--
-- 4. client_recovery_target: service-role only. Resolves a "forgot
--    password" request to a client account, so a reset link is only ever
--    generated for a linked client and at most once a minute per account.
--
-- Repeatable: every object is created idempotently, so a re-run after a
-- partial application converges on the same state.

-- ---------------------------------------------------------- trusted trigger

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := new.raw_app_meta_data ->> 'portal_role';
  v_subject_text text := new.raw_app_meta_data ->> 'portal_subject_id';
  v_subject_id uuid;
  v_name text := left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), new.email, ''), 120);
begin
  -- An account is linked at most once and never re-linked.
  if exists (select 1 from public.profiles where id = new.id) then
    return new;
  end if;

  -- No trusted link: an ordinary auth account without portal access.
  -- raw_user_meta_data is deliberately never consulted for role or subject.
  if v_role is null and v_subject_text is null then
    return new;
  end if;

  if v_role is null or v_role not in ('coach', 'klient') then
    raise exception 'handle_new_auth_user: invalid portal_role';
  end if;

  begin
    v_subject_id := nullif(v_subject_text, '')::uuid;
  exception when invalid_text_representation then
    raise exception 'handle_new_auth_user: invalid portal_subject_id';
  end;

  if v_subject_id is null or new.email is null then
    raise exception 'handle_new_auth_user: incomplete portal link';
  end if;

  if v_role = 'coach' then
    if not exists (select 1 from public.coaches where id = v_subject_id) then
      raise exception 'handle_new_auth_user: unknown coach';
    end if;
    insert into public.profiles (id, role, coach_id, email, name)
    values (new.id, 'coach', v_subject_id, new.email, v_name);
  else
    if not exists (select 1 from public.clients where id = v_subject_id and status = 'aktiv') then
      raise exception 'handle_new_auth_user: unknown or inactive client';
    end if;
    -- profiles_client_id_idx (unique) refuses a second account for a client.
    insert into public.profiles (id, role, client_id, email, name)
    values (new.id, 'klient', v_subject_id, new.email, v_name);
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_app_meta_data on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------- invitation ledger

create table if not exists public.client_invitations (
  client_id uuid primary key references public.clients (id) on delete cascade,
  auth_user_id uuid references auth.users (id) on delete set null,
  recipient_email text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempt_count integer not null default 0,
  last_attempt_at timestamptz,
  provider_message_id text,
  provider_accepted_at timestamptz,
  last_error_code text,
  last_error_message text,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_invitations_auth_user_id_idx on public.client_invitations (auth_user_id);

alter table public.client_invitations enable row level security;

-- Carolina reads her own. No write policy exists for any role: every write
-- goes through the coach RPCs below.
drop policy if exists client_invitations_select_coach on public.client_invitations;
create policy client_invitations_select_coach on public.client_invitations
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

grant select on table public.client_invitations to authenticated;

-- ---------------------------------------------------------- begin

-- Returns what the caller needs to provision and send: the normalised
-- recipient, the client's name, the already linked account (if any) and
-- whether that account's email is confirmed. Raises a stable code for every
-- refusal; the application maps codes to Swedish messages.
create or replace function public.begin_client_invitation(p_client_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coach_id uuid := public.current_coach_id();
  v_client public.clients%rowtype;
  v_email text;
  v_linked_id uuid;
  v_linked_email text;
  v_linked_confirmed boolean := false;
  v_email_user_id uuid;
  v_email_user_profile public.profiles%rowtype;
  v_invitation public.client_invitations%rowtype;
  v_attempt integer;
begin
  if v_coach_id is null then
    raise exception 'NOT_COACH';
  end if;

  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'CLIENT_NOT_FOUND';
  end if;

  -- Serialises concurrent invitation operations for the same client.
  select * into v_client from public.clients where id = p_client_id for update;

  if v_client.status <> 'aktiv' then
    raise exception 'CLIENT_NOT_ACTIVE';
  end if;

  v_email := lower(btrim(coalesce(v_client.email, '')));
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'INVALID_EMAIL';
  end if;

  -- The account already linked to this client, if any.
  select p.id, u.email, u.email_confirmed_at is not null
    into v_linked_id, v_linked_email, v_linked_confirmed
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.client_id = p_client_id;

  -- Any account that already uses the recipient address.
  select u.id into v_email_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  select * into v_invitation from public.client_invitations where client_id = p_client_id for update;

  if v_linked_id is not null then
    -- Activated through this flow, or a confirmed account provisioned before
    -- invitations existed (no ledger row).
    if v_invitation.activated_at is not null or (v_invitation.client_id is null and v_linked_confirmed) then
      raise exception 'ALREADY_ACTIVATED';
    end if;
    -- The client's address was changed after the account was created. The
    -- account is never re-pointed; this needs explicit handling.
    if lower(coalesce(v_linked_email, '')) <> v_email then
      raise exception 'LINKED_EMAIL_MISMATCH';
    end if;
  elsif v_email_user_id is not null then
    select * into v_email_user_profile from public.profiles where id = v_email_user_id;
    if found then
      -- Belongs to another client (or a coach). Never reassigned.
      raise exception 'EMAIL_IN_USE';
    end if;
    -- An account without a portal link (created outside this flow). Never
    -- adopted silently.
    raise exception 'EMAIL_UNLINKED_ACCOUNT';
  end if;

  if v_invitation.client_id is not null then
    if v_invitation.status = 'pending' and v_invitation.last_attempt_at > now() - interval '2 minutes' then
      raise exception 'INVITATION_IN_PROGRESS';
    end if;
    if v_invitation.status = 'sent' and v_invitation.last_attempt_at > now() - interval '1 minute' then
      raise exception 'INVITATION_RECENTLY_SENT';
    end if;

    update public.client_invitations
    set status = 'pending',
        recipient_email = v_email,
        auth_user_id = coalesce(v_linked_id, auth_user_id),
        attempt_count = attempt_count + 1,
        last_attempt_at = now(),
        provider_message_id = null,
        provider_accepted_at = null,
        last_error_code = null,
        last_error_message = null,
        updated_at = now()
    where client_id = p_client_id
    returning attempt_count into v_attempt;
  else
    insert into public.client_invitations (client_id, auth_user_id, recipient_email, status, attempt_count, last_attempt_at)
    values (p_client_id, v_linked_id, v_email, 'pending', 1, now())
    returning attempt_count into v_attempt;
  end if;

  return jsonb_build_object(
    'recipient_email', v_email,
    'client_name', v_client.name,
    'auth_user_id', v_linked_id,
    'auth_user_confirmed', coalesce(v_linked_confirmed, false),
    'attempt', v_attempt
  );
end;
$$;

-- ---------------------------------------------------------- record result

create or replace function public.record_client_invitation_result(
  p_client_id uuid,
  p_status text,
  p_auth_user_id uuid default null,
  p_provider_message_id text default null,
  p_error_code text default null,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_coach_id() is null then
    raise exception 'NOT_COACH';
  end if;

  if not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'CLIENT_NOT_FOUND';
  end if;

  if p_status not in ('sent', 'failed') then
    raise exception 'INVALID_STATUS';
  end if;

  -- Only an account that the trigger actually linked to this client may be
  -- recorded against it.
  if p_auth_user_id is not null and not exists (
    select 1 from public.profiles where id = p_auth_user_id and client_id = p_client_id
  ) then
    raise exception 'IDENTITY_MISMATCH';
  end if;

  update public.client_invitations
  set status = p_status,
      auth_user_id = coalesce(p_auth_user_id, auth_user_id),
      provider_message_id = case when p_status = 'sent' then left(p_provider_message_id, 200) else null end,
      provider_accepted_at = case when p_status = 'sent' then now() else null end,
      last_error_code = case when p_status = 'failed' then left(p_error_code, 80) else null end,
      last_error_message = case when p_status = 'failed' then left(p_error_message, 300) else null end,
      updated_at = now()
  where client_id = p_client_id and status = 'pending';
end;
$$;

-- ---------------------------------------------------------- status

-- state: activated | pending | sent | failed | not_invited
create or replace function public.client_portal_access(p_client_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_invitation public.client_invitations%rowtype;
  v_linked boolean := false;
  v_confirmed boolean := false;
  v_state text;
begin
  if public.current_coach_id() is null or not public.client_owned_by_current_coach(p_client_id) then
    raise exception 'CLIENT_NOT_FOUND';
  end if;

  select true, u.email_confirmed_at is not null
    into v_linked, v_confirmed
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.client_id = p_client_id;

  select * into v_invitation from public.client_invitations where client_id = p_client_id;

  if v_invitation.activated_at is not null
     or (v_invitation.client_id is null and coalesce(v_linked, false) and coalesce(v_confirmed, false)) then
    v_state := 'activated';
  elsif v_invitation.client_id is not null then
    v_state := v_invitation.status;
  else
    v_state := 'not_invited';
  end if;

  return jsonb_build_object(
    'state', v_state,
    'has_account', coalesce(v_linked, false),
    'recipient_email', v_invitation.recipient_email,
    'attempt_count', coalesce(v_invitation.attempt_count, 0),
    'last_attempt_at', v_invitation.last_attempt_at,
    'provider_accepted_at', v_invitation.provider_accepted_at,
    'last_error_code', v_invitation.last_error_code,
    'activated_at', v_invitation.activated_at,
    'pending_stale', v_invitation.status = 'pending' and v_invitation.last_attempt_at <= now() - interval '2 minutes'
  );
end;
$$;

-- ---------------------------------------------------------- activation

-- Called by the activation route with the client's own new session, after
-- the password has been set. Records the verified event; the client can
-- only ever mark its own invitation.
create or replace function public.mark_own_client_invitation_activated()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid := public.current_client_id();
begin
  if v_client_id is null then
    raise exception 'NOT_CLIENT';
  end if;

  update public.client_invitations
  set activated_at = coalesce(activated_at, now()),
      auth_user_id = coalesce(auth_user_id, (select auth.uid())),
      updated_at = now()
  where client_id = v_client_id;
end;
$$;

-- ---------------------------------------------------------- password recovery

-- Called only by the server with the service role, never by a browser.
-- Returns the account to reset, or null — for an unknown address, a coach,
-- an unlinked account, or a reset requested within the last minute. The
-- caller answers every request identically, so the result never reaches
-- the requester.
create or replace function public.client_recovery_target(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'klient'
    and p.client_id is not null
    and lower(u.email) = lower(btrim(p_email))
    and (u.recovery_sent_at is null or u.recovery_sent_at < now() - interval '60 seconds')
  limit 1;
$$;

revoke execute on function public.client_recovery_target(text) from public, anon, authenticated;
grant execute on function public.client_recovery_target(text) to service_role;

revoke execute on function public.begin_client_invitation(uuid) from public, anon;
revoke execute on function public.record_client_invitation_result(uuid, text, uuid, text, text, text) from public, anon;
revoke execute on function public.client_portal_access(uuid) from public, anon;
revoke execute on function public.mark_own_client_invitation_activated() from public, anon;

grant execute on function public.begin_client_invitation(uuid) to authenticated;
grant execute on function public.record_client_invitation_result(uuid, text, uuid, text, text, text) to authenticated;
grant execute on function public.client_portal_access(uuid) to authenticated;
grant execute on function public.mark_own_client_invitation_activated() to authenticated;
