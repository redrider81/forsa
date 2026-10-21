-- CVB Base — CVB-CR-20261021-01, part B: the client's own profile edit.
--
-- Fault: update_own_client_profile wrote public.clients.email only. When a
-- client changed her address under Profil, her Supabase Auth account and
-- her profile kept the old one, so she had to sign in with an address she
-- may no longer have, while Carolina and every email saw the new one.
--
-- Fix, the same shape as CVB-CR-20261015-01 for Carolina's correction:
--
--   begin_own_client_profile_update  validates and reports the plan for the
--                                    signed-in client; writes nothing.
--                                    Tells the server whether her own auth
--                                    account must be re-addressed first.
--   update_own_client_profile        (replaced, same signature) writes under
--                                    a row lock after re-validating
--                                    everything. When the email changes it
--                                    refuses unless her own account
--                                    (auth.uid(), never re-pointed) already
--                                    carries the new address. Profile email
--                                    and name follow.
--
-- Conflicts are refused, never repaired: an address used by another
-- account, another client or a coach. No table, column, policy or data
-- change. Repeatable: create or replace throughout.

-- ------------------------------------------------------------ shared check

create or replace function public.own_client_profile_check(
  p_name text,
  p_role text,
  p_email text,
  p_phone text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_client_id uuid := public.current_client_id();
  v_client public.clients%rowtype;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := btrim(coalesce(p_name, ''));
  v_role text := btrim(coalesce(p_role, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_changed boolean;
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_user_confirmed boolean := false;
begin
  if v_client_id is null or v_user_id is null then
    raise exception 'NOT_CLIENT';
  end if;

  if length(v_name) < 1 or length(v_name) > 120 then
    raise exception 'INVALID_NAME';
  end if;
  if length(v_role) < 1 or length(v_role) > 120 then
    raise exception 'INVALID_ROLE';
  end if;
  if length(v_phone) > 40 then
    raise exception 'INVALID_PHONE';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'INVALID_EMAIL';
  end if;

  select * into v_client from public.clients where id = v_client_id;
  v_changed := lower(btrim(coalesce(v_client.email, ''))) <> v_email;

  select u.email, u.email_confirmed_at is not null
    into v_user_email, v_user_confirmed
  from auth.users u
  where u.id = v_user_id;

  if v_changed then
    -- Any other account, any other client, any coach already using it.
    if exists (select 1 from auth.users u where lower(u.email) = v_email and u.id <> v_user_id)
       or exists (select 1 from public.clients c where c.id <> v_client_id and lower(btrim(c.email)) = v_email)
       or exists (select 1 from public.coaches co where lower(btrim(co.email)) = v_email) then
      raise exception 'EMAIL_IN_USE';
    end if;
  end if;

  return jsonb_build_object(
    'email', v_email,
    'email_changed', v_changed,
    'auth_user_id', v_user_id,
    'auth_user_email', v_user_email,
    'auth_user_confirmed', coalesce(v_user_confirmed, false)
  );
end;
$$;

-- Internal: reachable only through the two functions below.
revoke execute on function public.own_client_profile_check(text, text, text, text) from public, anon, authenticated;

-- ------------------------------------------------------------ B1. begin

create or replace function public.begin_own_client_profile_update(
  p_name text,
  p_role text,
  p_email text,
  p_phone text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  -- The account's current address is not exposed.
  return public.own_client_profile_check(p_name, p_role, p_email, p_phone) - 'auth_user_email';
end;
$$;

-- ------------------------------------------------------------ B2. update

create or replace function public.update_own_client_profile(
  p_name text,
  p_role text,
  p_email text,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid := public.current_client_id();
  v_plan jsonb;
begin
  if v_client_id is null then
    raise exception 'NOT_CLIENT';
  end if;

  -- Serialises with Carolina's correction and concurrent saves.
  perform 1 from public.clients where id = v_client_id for update;

  v_plan := public.own_client_profile_check(p_name, p_role, p_email, p_phone);

  if (v_plan ->> 'email_changed')::boolean
     and lower(coalesce(v_plan ->> 'auth_user_email', '')) <> (v_plan ->> 'email') then
    raise exception 'AUTH_EMAIL_NOT_SYNCED';
  end if;

  update public.clients
  set name = btrim(p_name),
      role = btrim(p_role),
      email = case when (v_plan ->> 'email_changed')::boolean then v_plan ->> 'email' else email end,
      phone = btrim(coalesce(p_phone, '')),
      updated_at = now()
  where id = v_client_id;

  update public.profiles
  set email = case when (v_plan ->> 'email_changed')::boolean then v_plan ->> 'email' else email end,
      name = left(btrim(p_name), 120)
  where id = auth.uid() and client_id = v_client_id;
end;
$$;

-- ------------------------------------------------------------ privileges

revoke execute on function public.begin_own_client_profile_update(text, text, text, text) from public, anon;
revoke execute on function public.update_own_client_profile(text, text, text, text) from public, anon;

grant execute on function public.begin_own_client_profile_update(text, text, text, text) to authenticated;
grant execute on function public.update_own_client_profile(text, text, text, text) to authenticated;
