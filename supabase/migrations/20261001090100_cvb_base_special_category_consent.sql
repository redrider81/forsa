-- CVB Base — explicit, auditable consent for special categories of personal
-- data (GDPR article 9.2 a).
--
-- Free text in CVB Base (reflections, preparations, notes, commitments,
-- session content, summaries, Carolina's working notes) can contain data
-- the client chooses to share that falls under article 9, e.g. health. This
-- models the client's separate, voluntary consent for that processing.
--
--   * One row per grant. Withdrawal stamps withdrawn_at on that row; nothing
--     is ever deleted by a withdrawal, and a later grant is a new row.
--   * At most one active (not withdrawn) consent per client.
--   * Only the client can grant or withdraw, only for themselves, only via
--     the RPCs below, with server-side timestamps. The coach can read the
--     state for her own clients. anon has no access.
--   * Rows are immutable except for the single transition
--     withdrawn_at: NULL -> timestamp.
--
-- The application uses the active state as a deterministic, source-level
-- gate: without active consent, conversation-content sources are excluded
-- from AI input (src/lib/ai/context.ts). No text is classified.

create table public.special_category_consents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  consent_version text not null,
  scope text not null default 'coaching_content' check (scope = 'coaching_content'),
  granted_at timestamptz not null default now(),
  granted_by_auth_user_id uuid not null references auth.users(id),
  withdrawn_at timestamptz,
  withdrawn_by_auth_user_id uuid references auth.users(id),
  constraint special_category_consents_withdrawal_pair
    check ((withdrawn_at is null) = (withdrawn_by_auth_user_id is null)),
  constraint special_category_consents_withdrawal_after_grant
    check (withdrawn_at is null or withdrawn_at >= granted_at)
);

create unique index special_category_consents_one_active_idx
  on public.special_category_consents (client_id)
  where withdrawn_at is null;

create index special_category_consents_client_id_idx
  on public.special_category_consents (client_id, granted_at desc);

-- Only the NULL -> timestamp withdrawal transition is allowed.
create or replace function public.special_category_consents_guard_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.withdrawn_at is not null
     or new.withdrawn_at is null
     or new.id <> old.id
     or new.client_id <> old.client_id
     or new.consent_version <> old.consent_version
     or new.scope <> old.scope
     or new.granted_at <> old.granted_at
     or new.granted_by_auth_user_id <> old.granted_by_auth_user_id then
    raise exception 'special_category_consents: only withdrawal of an active consent is allowed';
  end if;
  return new;
end;
$$;

create trigger special_category_consents_guard_update
  before update on public.special_category_consents
  for each row execute function public.special_category_consents_guard_update();

revoke execute on function public.special_category_consents_guard_update() from public, anon, authenticated;

alter table public.special_category_consents enable row level security;

create policy special_category_consents_select_klient on public.special_category_consents
  for select to authenticated
  using (client_id = public.current_client_id());

create policy special_category_consents_select_coach on public.special_category_consents
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

-- Read-only for signed-in roles; every write goes through the RPCs.
grant select on table public.special_category_consents to authenticated;

-- ------------------------------------------------- grant (client only)
--
-- The accepted versions are listed here, so a caller cannot record consent
-- to a text that was never shown. Idempotent: an already active consent is
-- returned unchanged.

create or replace function public.grant_special_category_consent(p_version text)
returns table (consent_id uuid, granted_at timestamptz, already_granted boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_existing public.special_category_consents%rowtype;
begin
  v_client_id := public.current_client_id();
  if v_client_id is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if p_version is null or p_version not in ('2026-10-01') then
    raise exception 'UNKNOWN_CONSENT_VERSION';
  end if;

  -- Serialise concurrent requests for the same client.
  perform 1 from public.clients where id = v_client_id for update;

  select * into v_existing
  from public.special_category_consents s
  where s.client_id = v_client_id and s.withdrawn_at is null;

  if v_existing.id is not null then
    consent_id := v_existing.id;
    granted_at := v_existing.granted_at;
    already_granted := true;
    return next;
    return;
  end if;

  insert into public.special_category_consents (client_id, consent_version, granted_by_auth_user_id)
  values (v_client_id, p_version, auth.uid())
  returning id, special_category_consents.granted_at into consent_id, granted_at;

  already_granted := false;
  return next;
end;
$$;

-- ------------------------------------------------- withdraw (client only)
--
-- Stamps the active consent as withdrawn. Idempotent: with no active consent
-- nothing changes and was_active is false.

create or replace function public.withdraw_special_category_consent()
returns table (consent_id uuid, withdrawn_at timestamptz, was_active boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
begin
  v_client_id := public.current_client_id();
  if v_client_id is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update public.special_category_consents s
  set withdrawn_at = now(), withdrawn_by_auth_user_id = auth.uid()
  where s.client_id = v_client_id and s.withdrawn_at is null
  returning s.id, s.withdrawn_at into consent_id, withdrawn_at;

  was_active := consent_id is not null;
  return next;
end;
$$;

grant execute on function public.grant_special_category_consent(text) to authenticated;
grant execute on function public.withdraw_special_category_consent() to authenticated;
revoke execute on function public.grant_special_category_consent(text) from public, anon;
revoke execute on function public.withdraw_special_category_consent() from public, anon;
