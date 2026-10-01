-- CVB Base — pin the exact version of the general terms to each contract.
--
--   coach sends     -> the current general terms version is written to the
--                      contract (send_contract_for_signature)
--   client signs    -> must confirm that same version (sign_contract_as_client)
--   coach signs     -> the contract keeps it; the confirmation renders exactly
--                      that version's text (application side)
--
-- Once set, the version never changes (trigger below, plus the column is not
-- in any client-role update grant).
--
-- Existing contracts are NOT backfilled: which terms a historical contract
-- accepted cannot be proven, so it stays NULL (legacy). A legacy contract
-- that is still 'skickat' gets the version the client confirms at signing —
-- the version shown to them at that moment.
--
-- Accepted versions are listed in the RPCs, mirroring
-- src/lib/legal/content/terms.ts (GENERAL_TERMS_VERSIONS). A new text version
-- needs a new entry in both places.

alter table public.contracts add column general_terms_version text;

create or replace function public.contracts_terms_version_immutable()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.general_terms_version is not null
     and new.general_terms_version is distinct from old.general_terms_version then
    raise exception 'contracts: general_terms_version is immutable once set';
  end if;
  return new;
end;
$$;

create trigger contracts_terms_version_immutable
  before update on public.contracts
  for each row execute function public.contracts_terms_version_immutable();

revoke execute on function public.contracts_terms_version_immutable() from public, anon, authenticated;

-- ------------------------------------------------- send pins the version
--
-- Same checks as 20260930090000; the new argument is the version the
-- application resolved as current. The one-argument signature is replaced.

drop function if exists public.send_contract_for_signature(uuid);

create or replace function public.send_contract_for_signature(
  p_contract_id uuid,
  p_general_terms_version text
)
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

  if p_general_terms_version is null or p_general_terms_version not in ('2026-10-01') then
    raise exception 'UNKNOWN_TERMS_VERSION';
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
      general_terms_version = p_general_terms_version,
      withdrawal_deadline = null,
      early_performance_requested_at = null,
      updated_at = now()
  where id = p_contract_id;

  return v_row.version_id;
end;
$$;

grant execute on function public.send_contract_for_signature(uuid, text) to authenticated;
revoke execute on function public.send_contract_for_signature(uuid, text) from public, anon;

-- ------------------------------------------------- client confirms the version
--
-- Same checks as 20260930090000, plus: the client confirms the terms version
-- shown to them. It must equal the pinned version; a legacy contract without
-- one gets the confirmed version pinned now.

drop function if exists public.sign_contract_as_client(uuid, uuid, boolean);

create or replace function public.sign_contract_as_client(
  p_contract_id uuid,
  p_version_id uuid,
  p_request_early_performance boolean default false,
  p_general_terms_version text default null
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

  if p_general_terms_version is null or p_general_terms_version not in ('2026-10-01') then
    raise exception 'UNKNOWN_TERMS_VERSION';
  end if;

  if v_row.general_terms_version is not null and v_row.general_terms_version <> p_general_terms_version then
    raise exception 'TERMS_VERSION_MISMATCH';
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
      general_terms_version = coalesce(v_row.general_terms_version, p_general_terms_version),
      early_performance_requested_at = case
        when v_row.counterparty_type = 'consumer' and coalesce(p_request_early_performance, false) then now()
        else null
      end,
      updated_at = now()
  where id = p_contract_id;
end;
$$;

grant execute on function public.sign_contract_as_client(uuid, uuid, boolean, text) to authenticated;
revoke execute on function public.sign_contract_as_client(uuid, uuid, boolean, text) from public, anon;
