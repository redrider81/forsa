-- AVTAL V1 — contract templates, customer-specific contracts, and
-- account-based signing (coach + authenticated client, no guests, no
-- external e-sign provider, no PDF).

-- ---------------------------------------------------------------- enums

create type public.contract_status as enum (
  'utkast',
  'skickat',
  'kund_signerad',
  'signerat',
  'arkiverat'
);

create type public.contract_signer_role as enum ('coach', 'klient');

-- ---------------------------------------------------------------- tables

create table public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  name text not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete set null,
  template_id uuid references public.contract_templates(id) on delete set null,

  title text not null,
  content jsonb not null default '{}'::jsonb,

  price_amount numeric,
  currency text not null default 'SEK',
  payment_terms text,

  status public.contract_status not null default 'utkast',
  version_id uuid not null default gen_random_uuid(),

  sent_at timestamptz,
  client_signed_at timestamptz,
  coach_signed_at timestamptz,
  locked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contract_signatures (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,

  signer_auth_user_id uuid not null references auth.users(id),
  signer_role public.contract_signer_role not null,
  signer_name text not null,
  signer_email text not null,

  contract_version_id uuid not null,
  signed_at timestamptz not null default now(),

  unique (contract_id, signer_role, contract_version_id)
);

create index contracts_coach_id_idx on public.contracts(coach_id);
create index contracts_client_id_idx on public.contracts(client_id);
create index contract_templates_coach_id_idx on public.contract_templates(coach_id);
create index contract_signatures_contract_id_idx on public.contract_signatures(contract_id);

-- ---------------------------------------------------------------- RLS

alter table public.contract_templates enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_signatures enable row level security;

-- contract_templates: coach manages only their own.

create policy contract_templates_select_coach on public.contract_templates
  for select to authenticated
  using (coach_id = public.current_coach_id());

create policy contract_templates_insert_coach on public.contract_templates
  for insert to authenticated
  with check (coach_id = public.current_coach_id());

create policy contract_templates_update_coach on public.contract_templates
  for update to authenticated
  using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

create policy contract_templates_delete_coach on public.contract_templates
  for delete to authenticated
  using (coach_id = public.current_coach_id());

-- contracts: coach reads own contracts, edits only while UTKAST. Client
-- reads own contracts once sent (never drafts).

create policy contracts_select_coach on public.contracts
  for select to authenticated
  using (coach_id = public.current_coach_id());

create policy contracts_select_klient on public.contracts
  for select to authenticated
  using (client_id = public.current_client_id() and status <> 'utkast');

create policy contracts_insert_coach on public.contracts
  for insert to authenticated
  with check (
    coach_id = public.current_coach_id()
    and public.client_owned_by_current_coach(client_id)
    and status = 'utkast'
  );

create policy contracts_update_coach_draft on public.contracts
  for update to authenticated
  using (coach_id = public.current_coach_id() and status = 'utkast')
  with check (coach_id = public.current_coach_id() and status = 'utkast');

-- contract_signatures: read-only for the two parties involved. Writes only
-- via the security-definer signing RPCs below.

create policy contract_signatures_select_coach on public.contract_signatures
  for select to authenticated
  using (
    contract_id in (select id from public.contracts where coach_id = public.current_coach_id())
  );

create policy contract_signatures_select_klient on public.contract_signatures
  for select to authenticated
  using (
    contract_id in (select id from public.contracts where client_id = public.current_client_id())
  );

-- ---------------------------------------------------------------- RPCs

create or replace function public.send_contract_for_signature(p_contract_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_version_id uuid;
begin
  v_coach_id := public.current_coach_id();
  if v_coach_id is null then
    raise exception 'Unauthorized';
  end if;

  select version_id into v_version_id
  from public.contracts
  where id = p_contract_id and coach_id = v_coach_id and status = 'utkast'
  for update;

  if v_version_id is null then
    raise exception 'Contract not found or not a draft';
  end if;

  update public.contracts
  set status = 'skickat', sent_at = now(), updated_at = now()
  where id = p_contract_id;

  return v_version_id;
end;
$$;

create or replace function public.sign_contract_as_client(p_contract_id uuid, p_version_id uuid)
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
  set status = 'kund_signerad', client_signed_at = now(), updated_at = now()
  where id = p_contract_id;
end;
$$;

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
    contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id
  ) values (
    p_contract_id, auth.uid(), 'coach', v_name, v_email, p_version_id
  );

  update public.contracts
  set status = 'signerat', coach_signed_at = now(), locked_at = now(), updated_at = now()
  where id = p_contract_id;
end;
$$;

grant execute on function public.send_contract_for_signature(uuid) to authenticated;
grant execute on function public.sign_contract_as_client(uuid, uuid) to authenticated;
grant execute on function public.sign_contract_as_coach(uuid, uuid) to authenticated;

revoke execute on function public.send_contract_for_signature(uuid) from public, anon;
revoke execute on function public.sign_contract_as_client(uuid, uuid) from public, anon;
revoke execute on function public.sign_contract_as_coach(uuid, uuid) from public, anon;
