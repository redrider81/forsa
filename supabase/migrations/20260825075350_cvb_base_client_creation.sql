-- CVB Base — client creation + agreements & documents.
--
-- 1. Private clients: organisation_id becomes nullable on clients and
--    engagements. No placeholder/artificial organisation row is created for
--    private clients — the column is simply NULL. The ownership chain for
--    RLS (engagements.coach_id) is unaffected, since it never depended on
--    organisation_id.
--
-- 2. Atomic client creation: a single SECURITY DEFINER function,
--    create_client_bundle, creates the organisation (optional), engagement,
--    client, coaching_agreement and development_goal rows in one statement.
--    It resolves the coach from the session (current_coach_id()), never
--    trusts a caller-supplied coach id, and is the only write path for
--    client creation — there is no direct INSERT policy for clients,
--    engagements or organisations because organisations has none today and
--    creating one row-by-row from the client would not be atomic.
--
-- 3. Documents: extended with file-management columns backing a new private
--    Storage bucket (added in the companion storage migration), plus coach
--    write policies. Documents were read-only until now; the coach may now
--    create/update/delete documents for clients they own.

-- --------------------------------------------------------------- clients / engagements

alter table public.clients alter column organisation_id drop not null;
alter table public.engagements alter column organisation_id drop not null;

-- --------------------------------------------------------------------- documents

create type public.document_status as enum ('aktiv', 'arkiverad');

alter table public.documents
  add column storage_path text,
  add column file_name text,
  add column mime_type text,
  add column size_bytes bigint,
  add column uploaded_by_coach_id uuid references public.coaches (id) on delete set null,
  add column status public.document_status not null default 'aktiv',
  add column signed_at date,
  add column expires_at date,
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();

create policy documents_insert_coach on public.documents
  for insert to authenticated
  with check (
    owner_type = 'klient'
    and public.client_owned_by_current_coach(owner_id)
    and uploaded_by_coach_id = public.current_coach_id()
  );

create policy documents_update_coach on public.documents
  for update to authenticated
  using (owner_type = 'klient' and public.client_owned_by_current_coach(owner_id))
  with check (owner_type = 'klient' and public.client_owned_by_current_coach(owner_id));

create policy documents_delete_coach on public.documents
  for delete to authenticated
  using (owner_type = 'klient' and public.client_owned_by_current_coach(owner_id));

grant insert, update, delete on table public.documents to authenticated;

-- ------------------------------------------------------------- create_client_bundle
--
-- p_organisation_id: existing organisation to attach (Företagsklient).
-- p_new_organisation: jsonb to create a new organisation inline instead of
--   selecting an existing one (Företagsklient). Mutually exclusive with
--   p_organisation_id.
-- Neither supplied => private client, organisation_id stays NULL.
--
-- The coaching agreement and development goal rows are created empty
-- (agreed_at = the client's start date, everything else blank) — the
-- agreement is filled in afterwards via the Avtal & dokument view. The
-- development goal has no editing surface in this pass; it exists only
-- because the table requires a row per client (mirrors the existing
-- EMPTY_AGREEMENT / EMPTY_GOAL fallback already used for reads).

create or replace function public.create_client_bundle(
  p_client jsonb,
  p_engagement jsonb,
  p_organisation_id uuid default null,
  p_new_organisation jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid := public.current_coach_id();
  v_organisation_id uuid;
  v_engagement_id uuid;
  v_client_id uuid;
  v_started_at date;
begin
  if v_coach_id is null then
    raise exception 'not a coach session';
  end if;

  if p_organisation_id is not null and p_new_organisation is not null then
    raise exception 'supply either p_organisation_id or p_new_organisation, not both';
  end if;

  if p_new_organisation is not null then
    insert into public.organisations (name, size_label, industry, location, sponsor_name, sponsor_role)
    values (
      p_new_organisation->>'name',
      p_new_organisation->>'sizeLabel',
      p_new_organisation->>'industry',
      p_new_organisation->>'location',
      nullif(p_new_organisation->>'sponsorName', ''),
      nullif(p_new_organisation->>'sponsorRole', '')
    )
    returning id into v_organisation_id;
  elsif p_organisation_id is not null then
    if not exists (select 1 from public.organisations where id = p_organisation_id) then
      raise exception 'organisation not found';
    end if;
    v_organisation_id := p_organisation_id;
  else
    v_organisation_id := null;
  end if;

  v_started_at := coalesce((p_client->>'startedAt')::date, current_date);

  insert into public.engagements (
    organisation_id, coach_id, title, kind, kind_label, purpose, scope_note,
    period_label, start_date, end_date, status, sponsor_reporting
  )
  values (
    v_organisation_id,
    v_coach_id,
    p_engagement->>'title',
    (p_engagement->>'kind')::public.engagement_kind,
    p_engagement->>'kindLabel',
    coalesce(p_engagement->>'purpose', ''),
    coalesce(p_engagement->>'scopeNote', ''),
    coalesce(p_engagement->>'periodLabel', ''),
    coalesce((p_engagement->>'startDate')::date, v_started_at),
    (p_engagement->>'endDate')::date,
    coalesce((p_engagement->>'status')::public.engagement_status, 'pagaende'),
    ''
  )
  returning id into v_engagement_id;

  insert into public.clients (
    engagement_id, organisation_id, name, initials, role, email, phone, headline,
    started_at, depth, recurring_themes
  )
  values (
    v_engagement_id,
    v_organisation_id,
    p_client->>'name',
    p_client->>'initials',
    p_client->>'role',
    p_client->>'email',
    coalesce(p_client->>'phone', ''),
    coalesce(p_client->>'headline', ''),
    v_started_at,
    'full',
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(p_client->'recurringThemes')),
      '{}'
    )
  )
  returning id into v_client_id;

  insert into public.coaching_agreements (
    client_id, agreed_at, purpose, scope, cadence, confidentiality, sponsor_sharing, ethics, client_responsibility
  )
  values (v_client_id, v_started_at, '', '', '', '', '', '', '');

  insert into public.development_goals (
    client_id, headline, client_wording, baseline, success_criteria, horizon
  )
  values (v_client_id, '', '', '', '{}', '');

  return v_client_id;
end;
$$;

grant execute on function public.create_client_bundle(jsonb, jsonb, uuid, jsonb) to authenticated;
