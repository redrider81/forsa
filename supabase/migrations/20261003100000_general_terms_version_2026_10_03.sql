-- Accept general terms version 2026-10-03 (public copy update; 2026-10-01 frozen).

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

  if p_general_terms_version is null or p_general_terms_version not in ('2026-10-01', '2026-10-03') then
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

  if p_general_terms_version is null or p_general_terms_version not in ('2026-10-01', '2026-10-03') then
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

grant execute on function public.send_contract_for_signature(uuid, text) to authenticated;
revoke execute on function public.send_contract_for_signature(uuid, text) from public, anon;

grant execute on function public.sign_contract_as_client(uuid, uuid, boolean, text) to authenticated;
revoke execute on function public.sign_contract_as_client(uuid, uuid, boolean, text) from public, anon;
