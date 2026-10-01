-- CVB Base — consumer/business classification and the online withdrawal
-- function (ångerfunktion) for consumer contracts.
--
-- Legal frame: lagen (2005:59) om distansavtal och avtal utanför
-- affärslokaler, as amended from 19 June 2026 (Directive (EU) 2023/2673,
-- new Article 11a of Directive 2011/83/EU). A consumer who concludes a
-- distance contract through an online interface must be able to withdraw
-- through a clearly labelled function in that same interface, and must
-- receive an acknowledgement of receipt.
--
-- Design decisions, in short:
--
--   * Consumer vs business is an explicit, per-contract fact chosen by the
--     coach before sending. It is never derived from clients.organisation_id.
--     Existing contracts are left NULL ("not classified") — nothing here
--     assumes that an old contract is a consumer contract.
--
--   * A CVB contract is concluded when the second signature — the coach's —
--     is placed (status 'signerat'). The withdrawal period therefore runs
--     from coach_signed_at. That is also the most consumer-favourable
--     reading: if the client's own signature were ever held to conclude the
--     contract, the period computed here is never shorter.
--     The client may additionally withdraw between their own signature and
--     the coach's countersignature; the coach can then no longer sign.
--
--   * The withdrawal right is not a toggle. Every consumer contract is signed
--     through CVB Base's online interface, so it applies to every consumer
--     contract. Business contracts never get it.
--
--   * Withdrawal is its own append-only audit record. Contract status and
--     both signatures are never mutated or removed.
--
--   * Notification emails follow the existing outbox pattern from the public
--     booking chain: rows are written in the same transaction as the
--     withdrawal, sending happens after commit, and a failed send can never
--     undo a registered withdrawal.

-- ------------------------------------------------- 0. missing base grants
--
-- The contract tables have carried RLS policies since 20260826150000 but no
-- base privileges for `authenticated` (new entities are not auto-exposed —
-- see supabase/config.toml), so PostgREST refused every read before RLS was
-- evaluated. Same class of fix as the public_booking_requests grant in
-- 20260908090000. Privileges below mirror the existing policies exactly and
-- are column-scoped where the app only ever writes a known set of columns,
-- so no signing, locking or withdrawal column is writable directly.

grant select, insert, update, delete on table public.contract_templates to authenticated;

grant select on table public.contracts to authenticated;
grant insert (
  coach_id, client_id, engagement_id, template_id, title, content,
  price_amount, currency, payment_terms
) on table public.contracts to authenticated;
grant update (
  title, content, engagement_id, price_amount, currency, payment_terms, updated_at
) on table public.contracts to authenticated;

grant select on table public.contract_signatures to authenticated;

-- ------------------------------------------------- 1. classification

create type public.contract_counterparty_type as enum ('consumer', 'business');

alter table public.contracts
  -- NULL = not yet classified. Required before sending (see RPC below).
  add column counterparty_type public.contract_counterparty_type,
  -- Consumer contracts only: the instant the withdrawal period ends
  -- (exclusive). Set server-side when the contract is concluded.
  add column withdrawal_deadline timestamptz,
  -- Consumer contracts only: when the consumer, as a separate explicit act
  -- at signing, asked for the service to start during the withdrawal period.
  add column early_performance_requested_at timestamptz;

-- The coach chooses the type when creating a draft. Insert only — changing
-- it afterwards goes through set_contract_counterparty_type().
grant insert (counterparty_type) on table public.contracts to authenticated;

-- ------------------------------------------------- 2. deadline calculation
--
-- 14 days from the day the contract is concluded, the conclusion day itself
-- not counted (Regulation (EEC, Euratom) No 1182/71). If the last day is a
-- Saturday, Sunday or Swedish public holiday the period runs to the end of
-- the next working day. Midsummer Eve, Christmas Eve and New Year's Eve are
-- treated as holidays as in lagen (1930:173) om beräkning av lagstadgad tid.
-- Erring on these days only ever lengthens the period.

create or replace function public.swedish_easter_sunday(p_year int)
returns date
language plpgsql
immutable
set search_path = public
as $$
declare
  a int := p_year % 19;
  b int := p_year / 100;
  c int := p_year % 100;
  d int := b / 4;
  e int := b % 4;
  f int := (b + 8) / 25;
  g int := (b - f + 1) / 3;
  h int := (19 * a + b - d - g + 15) % 30;
  i int := c / 4;
  k int := c % 4;
  l int := (32 + 2 * e + 2 * i - h - k) % 7;
  m int := (a + 11 * h + 22 * l) / 451;
  v_month int := (h + l - 7 * m + 114) / 31;
  v_day int := ((h + l - 7 * m + 114) % 31) + 1;
begin
  return make_date(p_year, v_month, v_day);
end;
$$;

create or replace function public.swedish_non_business_day(p_date date)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  v_easter date := public.swedish_easter_sunday(extract(year from p_date)::int);
  v_md text := to_char(p_date, 'MM-DD');
begin
  if extract(isodow from p_date) in (6, 7) then
    return true;
  end if;

  -- Fixed-date holidays and eves.
  if v_md in ('01-01', '01-06', '05-01', '06-06', '12-24', '12-25', '12-26', '12-31') then
    return true;
  end if;

  -- Good Friday, Easter Monday, Ascension Day.
  if p_date in (v_easter - 2, v_easter + 1, v_easter + 39) then
    return true;
  end if;

  -- Midsummer Eve: the Friday between 19 and 25 June.
  if extract(month from p_date) = 6
     and extract(day from p_date) between 19 and 25
     and extract(isodow from p_date) = 5 then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.contract_withdrawal_deadline(p_concluded_at timestamptz)
returns timestamptz
language plpgsql
stable
set search_path = public
as $$
declare
  v_last_day date;
begin
  v_last_day := (p_concluded_at at time zone 'Europe/Stockholm')::date + 14;
  while public.swedish_non_business_day(v_last_day) loop
    v_last_day := v_last_day + 1;
  end loop;
  -- End of the last day, Stockholm time: midnight at the start of the next.
  return (v_last_day + 1)::timestamp at time zone 'Europe/Stockholm';
end;
$$;

-- Internal helpers: only ever called from the SECURITY DEFINER RPCs below.
revoke execute on function public.swedish_easter_sunday(int) from public, anon, authenticated;
revoke execute on function public.swedish_non_business_day(date) from public, anon, authenticated;
revoke execute on function public.contract_withdrawal_deadline(timestamptz) from public, anon, authenticated;

-- ------------------------------------------------- 3. withdrawal audit record
--
-- One row per exercised withdrawal, written only by
-- exercise_contract_withdrawal(). Snapshots (title, version, name, email,
-- deadline) keep the record meaningful even if the client later edits their
-- profile. Rows are immutable; deletion is blocked by FK and by the absence
-- of any delete privilege.

create table public.contract_withdrawals (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null unique references public.contracts(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  contract_version_id uuid not null,
  contract_title text not null,
  requested_by_auth_user_id uuid not null references auth.users(id),
  requester_name text not null,
  receipt_email text not null,
  -- NULL when exercised before the coach's countersignature, i.e. before the
  -- contract was concluded and a deadline existed.
  withdrawal_deadline timestamptz,
  requested_at timestamptz not null default now()
);

create index contract_withdrawals_client_id_idx on public.contract_withdrawals(client_id);

create or replace function public.contract_withdrawals_immutable()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'contract_withdrawals is append-only';
end;
$$;

create trigger contract_withdrawals_no_update
  before update on public.contract_withdrawals
  for each row execute function public.contract_withdrawals_immutable();

revoke execute on function public.contract_withdrawals_immutable() from public, anon, authenticated;

alter table public.contract_withdrawals enable row level security;

create policy contract_withdrawals_select_coach on public.contract_withdrawals
  for select to authenticated
  using (
    contract_id in (select id from public.contracts where coach_id = public.current_coach_id())
  );

create policy contract_withdrawals_select_klient on public.contract_withdrawals
  for select to authenticated
  using (client_id = public.current_client_id());

grant select on table public.contract_withdrawals to authenticated;

-- ------------------------------------------------- 4. notification outbox
--
-- Same semantics as public_booking_notifications: 'sent' means the email
-- provider accepted the request, nothing more, and it is terminal.

create table public.contract_withdrawal_notifications (
  id uuid primary key default gen_random_uuid(),
  withdrawal_id uuid not null references public.contract_withdrawals(id) on delete cascade,
  event_type text not null check (event_type in (
    'client_withdrawal_receipt',
    'coach_withdrawal_notice'
  )),
  recipient_type text not null check (recipient_type in ('client', 'coach')),
  recipient_email text,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempt_count integer not null default 0,
  last_attempt_at timestamptz,
  provider_message_id text,
  provider_accepted_at timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contract_withdrawal_notifications_event_key unique (withdrawal_id, event_type)
);

create index contract_withdrawal_notifications_status_idx
  on public.contract_withdrawal_notifications (status, created_at);

alter table public.contract_withdrawal_notifications enable row level security;

-- Carolina reads her own. Clients never read the ledger; they get the email
-- and the on-screen confirmation.
create policy contract_withdrawal_notifications_select_coach on public.contract_withdrawal_notifications
  for select to authenticated
  using (
    exists (
      select 1
      from public.contract_withdrawals w
      join public.contracts c on c.id = w.contract_id
      where w.id = contract_withdrawal_notifications.withdrawal_id
        and c.coach_id = public.current_coach_id()
    )
  );

grant select on table public.contract_withdrawal_notifications to authenticated;

-- ------------------------------------------------- 5. sending requires a type

create or replace function public.send_contract_for_signature(p_contract_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_row public.contracts%rowtype;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_row
  from public.contracts
  where id = p_contract_id and coach_id = v_coach_id and status = 'utkast'
  for update;

  if v_row.id is null then
    raise exception 'Contract not found or not a draft';
  end if;

  if v_row.counterparty_type is null then
    raise exception 'COUNTERPARTY_TYPE_REQUIRED';
  end if;

  update public.contracts
  set status = 'skickat',
      sent_at = now(),
      -- Only the signing RPCs may ever set these.
      withdrawal_deadline = null,
      early_performance_requested_at = null,
      updated_at = now()
  where id = p_contract_id;

  return v_row.version_id;
end;
$$;

-- ------------------------------------------------- 6. setting the type
--
-- Allowed while the contract is a draft, and — for contracts sent before
-- this migration — while it is sent, still unclassified and unsigned by the
-- client. Once the client has signed, the type is fixed.

create or replace function public.set_contract_counterparty_type(
  p_contract_id uuid,
  p_counterparty_type public.contract_counterparty_type
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_row public.contracts%rowtype;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_counterparty_type is null then
    raise exception 'COUNTERPARTY_TYPE_REQUIRED';
  end if;

  select * into v_row from public.contracts
  where id = p_contract_id and coach_id = v_coach_id
  for update;

  if v_row.id is null then
    raise exception 'Contract not found or unauthorized';
  end if;

  if not (
    v_row.status = 'utkast'
    or (
      v_row.status = 'skickat'
      and v_row.counterparty_type is null
      and not exists (
        select 1 from public.contract_signatures s
        where s.contract_id = p_contract_id and s.signer_role = 'klient'
      )
    )
  ) then
    raise exception 'COUNTERPARTY_TYPE_LOCKED';
  end if;

  update public.contracts
  set counterparty_type = p_counterparty_type, updated_at = now()
  where id = p_contract_id;
end;
$$;

grant execute on function public.set_contract_counterparty_type(uuid, public.contract_counterparty_type) to authenticated;
revoke execute on function public.set_contract_counterparty_type(uuid, public.contract_counterparty_type) from public, anon;

-- ------------------------------------------------- 7. client signing
--
-- Unchanged checks, plus: the contract must be classified, and a consumer
-- may — as a separate, explicit choice — ask for the service to start
-- during the withdrawal period. That request is timestamped server-side and
-- ignored for business contracts. The old two-argument signature is
-- replaced; the new third argument defaults to false, so existing callers
-- keep working.

drop function if exists public.sign_contract_as_client(uuid, uuid);

create or replace function public.sign_contract_as_client(
  p_contract_id uuid,
  p_version_id uuid,
  p_request_early_performance boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_row public.contracts%rowtype;
  v_name text;
  v_email text;
begin
  v_client_id := public.current_client_id();
  if v_client_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_row from public.contracts where id = p_contract_id for update;

  if v_row.id is null or v_row.client_id <> v_client_id then
    raise exception 'Contract not found or unauthorized';
  end if;

  if v_row.status <> 'skickat' then
    raise exception 'Contract is not awaiting client signature';
  end if;

  if v_row.version_id <> p_version_id then
    raise exception 'Contract version mismatch';
  end if;

  if v_row.counterparty_type is null then
    raise exception 'COUNTERPARTY_TYPE_REQUIRED';
  end if;

  if exists (
    select 1 from public.contract_signatures
    where contract_id = p_contract_id and signer_role = 'klient' and contract_version_id = p_version_id
  ) then
    raise exception 'Contract already signed by client';
  end if;

  select name, email into v_name, v_email from public.clients where id = v_client_id;

  insert into public.contract_signatures (
    contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id
  ) values (
    p_contract_id, auth.uid(), 'klient', v_name, v_email, p_version_id
  );

  update public.contracts
  set status = 'kund_signerad',
      client_signed_at = now(),
      early_performance_requested_at = case
        when v_row.counterparty_type = 'consumer' and coalesce(p_request_early_performance, false) then now()
        else null
      end,
      updated_at = now()
  where id = p_contract_id;
end;
$$;

grant execute on function public.sign_contract_as_client(uuid, uuid, boolean) to authenticated;
revoke execute on function public.sign_contract_as_client(uuid, uuid, boolean) from public, anon;

-- ------------------------------------------------- 8. coach signing = conclusion

create or replace function public.sign_contract_as_coach(p_contract_id uuid, p_version_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_row public.contracts%rowtype;
  v_name text;
  v_email text;
  v_now timestamptz := now();
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_row from public.contracts where id = p_contract_id for update;

  if v_row.id is null or v_row.coach_id <> v_coach_id then
    raise exception 'Contract not found or unauthorized';
  end if;

  if v_row.status <> 'kund_signerad' then
    raise exception 'Contract is not awaiting coach signature';
  end if;

  if v_row.version_id <> p_version_id then
    raise exception 'Contract version mismatch';
  end if;

  -- A consumer who withdrew before the countersignature has taken back
  -- their side; the contract can no longer be concluded.
  if exists (select 1 from public.contract_withdrawals where contract_id = p_contract_id) then
    raise exception 'CONTRACT_WITHDRAWN';
  end if;

  if not exists (
    select 1 from public.contract_signatures
    where contract_id = p_contract_id and signer_role = 'klient' and contract_version_id = p_version_id
  ) then
    raise exception 'Client has not signed yet';
  end if;

  if exists (
    select 1 from public.contract_signatures
    where contract_id = p_contract_id and signer_role = 'coach' and contract_version_id = p_version_id
  ) then
    raise exception 'Contract already signed by coach';
  end if;

  select name, email into v_name, v_email from public.coaches where id = v_coach_id;

  insert into public.contract_signatures (
    contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id, signed_at
  ) values (
    p_contract_id, auth.uid(), 'coach', v_name, v_email, p_version_id, v_now
  );

  update public.contracts
  set status = 'signerat',
      coach_signed_at = v_now,
      locked_at = v_now,
      withdrawal_deadline = case
        when v_row.counterparty_type = 'consumer' then public.contract_withdrawal_deadline(v_now)
        else null
      end,
      updated_at = v_now
  where id = p_contract_id;
end;
$$;

-- ------------------------------------------------- 9. exercising withdrawal
--
-- Client-only, own contracts only, consumer contracts only, within the
-- period. Idempotent: a second call returns the existing record and changes
-- nothing. The withdrawal row and both outbox rows commit together.

create or replace function public.exercise_contract_withdrawal(p_contract_id uuid)
returns table (withdrawal_id uuid, requested_at timestamptz, already_withdrawn boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_row public.contracts%rowtype;
  v_existing public.contract_withdrawals%rowtype;
  v_deadline timestamptz;
  v_name text;
  v_email text;
  v_id uuid;
  v_at timestamptz;
begin
  v_client_id := public.current_client_id();
  if v_client_id is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_row from public.contracts where id = p_contract_id for update;

  if v_row.id is null or v_row.client_id <> v_client_id then
    raise exception 'CONTRACT_NOT_FOUND';
  end if;

  select * into v_existing from public.contract_withdrawals w where w.contract_id = p_contract_id;
  if v_existing.id is not null then
    withdrawal_id := v_existing.id;
    requested_at := v_existing.requested_at;
    already_withdrawn := true;
    return next;
    return;
  end if;

  if v_row.counterparty_type is distinct from 'consumer' then
    raise exception 'WITHDRAWAL_NOT_AVAILABLE';
  end if;

  if v_row.status not in ('kund_signerad', 'signerat', 'arkiverat')
     or not exists (
       select 1 from public.contract_signatures s
       where s.contract_id = p_contract_id and s.signer_role = 'klient'
     ) then
    raise exception 'WITHDRAWAL_NOT_AVAILABLE';
  end if;

  v_deadline := coalesce(
    v_row.withdrawal_deadline,
    case when v_row.coach_signed_at is not null
      then public.contract_withdrawal_deadline(v_row.coach_signed_at)
    end
  );

  if v_deadline is not null and now() >= v_deadline then
    raise exception 'WITHDRAWAL_PERIOD_EXPIRED';
  end if;

  select c.name, c.email into v_name, v_email from public.clients c where c.id = v_client_id;

  insert into public.contract_withdrawals (
    contract_id, client_id, contract_version_id, contract_title,
    requested_by_auth_user_id, requester_name, receipt_email, withdrawal_deadline
  ) values (
    p_contract_id, v_client_id, v_row.version_id, v_row.title,
    auth.uid(), v_name, coalesce(nullif(trim(v_email), ''), ''), v_deadline
  )
  returning id, contract_withdrawals.requested_at into v_id, v_at;

  insert into public.contract_withdrawal_notifications (
    withdrawal_id, event_type, recipient_type, recipient_email, idempotency_key
  ) values
    (v_id, 'client_withdrawal_receipt', 'client', nullif(trim(v_email), ''),
     'cvb-contract-withdrawal/' || v_id::text || '/client_withdrawal_receipt'),
    (v_id, 'coach_withdrawal_notice', 'coach', null,
     'cvb-contract-withdrawal/' || v_id::text || '/coach_withdrawal_notice');

  withdrawal_id := v_id;
  requested_at := v_at;
  already_withdrawn := false;
  return next;
end;
$$;

grant execute on function public.exercise_contract_withdrawal(uuid) to authenticated;
revoke execute on function public.exercise_contract_withdrawal(uuid) from public, anon;

-- ------------------------------------------------- 10. recording send results
--
-- Post-commit only. Authorised for the withdrawing client (initial send) and
-- the owning coach (retry). Cannot create, alter or remove a withdrawal.

create or replace function public.record_contract_withdrawal_notification_result(
  p_withdrawal_id uuid,
  p_event_type text,
  p_status text,
  p_recipient_email text default null,
  p_provider_message_id text default null,
  p_error_code text default null,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_withdrawal public.contract_withdrawals%rowtype;
  v_coach_id uuid;
  v_current text;
begin
  if p_status not in ('sending', 'sent', 'failed') then
    raise exception 'INVALID_NOTIFICATION_STATUS';
  end if;

  select * into v_withdrawal from public.contract_withdrawals where id = p_withdrawal_id;
  if v_withdrawal.id is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select coach_id into v_coach_id from public.contracts where id = v_withdrawal.contract_id;

  if not (
    coalesce(v_withdrawal.client_id = public.current_client_id(), false)
    or coalesce(v_coach_id = public.current_coach_id(), false)
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select status into v_current
  from public.contract_withdrawal_notifications
  where withdrawal_id = p_withdrawal_id and event_type = p_event_type
  for update;

  if v_current is null then
    raise exception 'NOTIFICATION_NOT_FOUND';
  end if;

  if v_current = 'sent' then
    return;
  end if;

  update public.contract_withdrawal_notifications
  set status = p_status,
      attempt_count = case when p_status = 'sending' then attempt_count + 1 else attempt_count end,
      last_attempt_at = case when p_status = 'sending' then now() else last_attempt_at end,
      recipient_email = coalesce(recipient_email, nullif(trim(coalesce(p_recipient_email, '')), '')),
      provider_message_id = case when p_status = 'sent' then p_provider_message_id else provider_message_id end,
      provider_accepted_at = case when p_status = 'sent' then now() else provider_accepted_at end,
      last_error_code = case when p_status = 'failed' then left(coalesce(p_error_code, 'provider_error'), 80) else null end,
      last_error_message = case when p_status = 'failed' then left(coalesce(p_error_message, ''), 300) else null end,
      updated_at = now()
  where withdrawal_id = p_withdrawal_id and event_type = p_event_type;
end;
$$;

grant execute on function public.record_contract_withdrawal_notification_result(uuid, text, text, text, text, text, text) to authenticated;
revoke execute on function public.record_contract_withdrawal_notification_result(uuid, text, text, text, text, text, text) from public, anon;
