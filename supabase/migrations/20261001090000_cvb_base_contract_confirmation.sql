-- CVB Base — durable contract confirmation for consumer contracts.
--
-- When a consumer contract is concluded (the coach's countersignature,
-- status 'signerat'), the consumer receives a confirmation on a durable
-- medium: an email that reproduces the signed version of the contract, the
-- price and payment terms, the applicable general terms and the withdrawal
-- information (lagen (2005:59) om distansavtal och avtal utanför
-- affärslokaler).
--
-- Same outbox semantics as the booking and withdrawal ledgers:
--
--   * the confirmation row is written in the SAME transaction as the
--     countersignature, at most once per contract (unique contract_id);
--   * sending happens after commit and can never undo or repeat a signature;
--   * the rendered subject and body are stored the first time they are
--     produced and never overwritten, so a retry re-sends exactly what was
--     first rendered from the locked contract, whatever later happens to the
--     website's terms page.
--
-- Business contracts get no confirmation row; their flow is unchanged.

create table public.contract_confirmation_notifications (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null unique references public.contracts(id) on delete restrict,
  contract_version_id uuid not null,
  recipient_email text,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempt_count integer not null default 0,
  last_attempt_at timestamptz,
  provider_message_id text,
  provider_accepted_at timestamptz,
  last_error_code text,
  last_error_message text,
  -- Immutable snapshot of what is sent. Set once, never replaced.
  rendered_subject text,
  rendered_body text,
  terms_version text,
  rendered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contract_confirmation_notifications_status_idx
  on public.contract_confirmation_notifications (status, created_at);

alter table public.contract_confirmation_notifications enable row level security;

-- Carolina reads her own. Clients receive the email; they never read the
-- ledger. No write policy exists for any role.
create policy contract_confirmation_notifications_select_coach on public.contract_confirmation_notifications
  for select to authenticated
  using (
    contract_id in (select id from public.contracts where coach_id = public.current_coach_id())
  );

grant select on table public.contract_confirmation_notifications to authenticated;

-- ------------------------------------------------- countersignature queues it
--
-- Identical to the definition in 20260930090000 except for the final block,
-- which queues the confirmation for consumer contracts in the same
-- transaction. A repeated call is still refused by the status check, and the
-- unique contract_id makes a second row impossible regardless.

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
  v_client_email text;
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

  if v_row.counterparty_type = 'consumer' then
    select nullif(trim(c.email), '') into v_client_email from public.clients c where c.id = v_row.client_id;

    insert into public.contract_confirmation_notifications (
      contract_id, contract_version_id, recipient_email, idempotency_key
    ) values (
      p_contract_id, p_version_id, v_client_email,
      'cvb-contract-confirmation/' || p_contract_id::text || '/' || p_version_id::text
    )
    on conflict (contract_id) do nothing;
  end if;
end;
$$;

-- ------------------------------------------------- recording send results
--
-- Owning coach only: the confirmation is sent from the coach's signing
-- request and retried from the coach's dashboard. The rendered snapshot is
-- write-once. A row recorded as 'sent' is terminal.

create or replace function public.record_contract_confirmation_result(
  p_contract_id uuid,
  p_status text,
  p_rendered_subject text default null,
  p_rendered_body text default null,
  p_terms_version text default null,
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
  v_current text;
begin
  if p_status not in ('sending', 'sent', 'failed') then
    raise exception 'INVALID_NOTIFICATION_STATUS';
  end if;

  if not exists (
    select 1 from public.contracts
    where id = p_contract_id and coach_id = public.current_coach_id()
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select status into v_current
  from public.contract_confirmation_notifications
  where contract_id = p_contract_id
  for update;

  if v_current is null then
    raise exception 'NOTIFICATION_NOT_FOUND';
  end if;

  if v_current = 'sent' then
    return;
  end if;

  update public.contract_confirmation_notifications
  set status = p_status,
      attempt_count = case when p_status = 'sending' then attempt_count + 1 else attempt_count end,
      last_attempt_at = case when p_status = 'sending' then now() else last_attempt_at end,
      rendered_subject = coalesce(rendered_subject, p_rendered_subject),
      rendered_body = coalesce(rendered_body, p_rendered_body),
      terms_version = coalesce(terms_version, p_terms_version),
      rendered_at = coalesce(rendered_at, case when p_rendered_body is not null then now() end),
      provider_message_id = case when p_status = 'sent' then p_provider_message_id else provider_message_id end,
      provider_accepted_at = case when p_status = 'sent' then now() else provider_accepted_at end,
      last_error_code = case when p_status = 'failed' then left(coalesce(p_error_code, 'provider_error'), 80) else null end,
      last_error_message = case when p_status = 'failed' then left(coalesce(p_error_message, ''), 300) else null end,
      updated_at = now()
  where contract_id = p_contract_id;
end;
$$;

grant execute on function public.record_contract_confirmation_result(uuid, text, text, text, text, text, text, text) to authenticated;
revoke execute on function public.record_contract_confirmation_result(uuid, text, text, text, text, text, text, text) from public, anon;
