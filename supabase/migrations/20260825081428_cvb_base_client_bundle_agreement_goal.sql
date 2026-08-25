-- CVB Base — feature acceptance correction: create_client_bundle now takes
-- the coaching agreement and development goal as input instead of creating
-- empty placeholder rows. Also hardens two issues found during acceptance
-- review:
--   * optional JSON dates (start/end date, agreed-at) can arrive as empty
--     strings from a form and must not raise a cast error before reaching
--     their fallback — wrapped in nullif(..., '') before casting.
--   * selecting an EXISTING organisation must be constrained to
--     organisations the calling coach already has access to (an engagement
--     they own), not merely "this organisation id exists" — the function is
--     SECURITY DEFINER, so an unconstrained existence check would let any
--     authenticated coach attach a client to any organisation in the
--     database.
--
-- The old 4-argument overload is dropped so PostgREST never exposes both
-- signatures.

drop function if exists public.create_client_bundle(jsonb, jsonb, uuid, jsonb);

create or replace function public.create_client_bundle(
  p_client jsonb,
  p_engagement jsonb,
  p_agreement jsonb,
  p_goal jsonb,
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
    -- SECURITY DEFINER: an existing organisation may only be attached if the
    -- calling coach already has access to it through an engagement they own.
    if not exists (
      select 1
      from public.organisations o
      join public.engagements e on e.organisation_id = o.id
      where o.id = p_organisation_id and e.coach_id = v_coach_id
    ) then
      raise exception 'organisation not found or not accessible';
    end if;
    v_organisation_id := p_organisation_id;
  else
    v_organisation_id := null;
  end if;

  v_started_at := coalesce(nullif(p_client->>'startedAt', '')::date, current_date);

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
    coalesce(nullif(p_engagement->>'startDate', '')::date, v_started_at),
    nullif(p_engagement->>'endDate', '')::date,
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
  values (
    v_client_id,
    coalesce(nullif(p_agreement->>'agreedAt', '')::date, v_started_at),
    coalesce(p_agreement->>'purpose', ''),
    coalesce(p_agreement->>'scope', ''),
    coalesce(p_agreement->>'cadence', ''),
    coalesce(p_agreement->>'confidentiality', ''),
    coalesce(p_agreement->>'sponsorSharing', ''),
    coalesce(p_agreement->>'ethics', ''),
    coalesce(p_agreement->>'clientResponsibility', '')
  );

  insert into public.development_goals (
    client_id, headline, client_wording, baseline, success_criteria, horizon
  )
  values (
    v_client_id,
    coalesce(p_goal->>'headline', ''),
    coalesce(p_goal->>'clientWording', ''),
    coalesce(p_goal->>'baseline', ''),
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(p_goal->'successCriteria')),
      '{}'
    ),
    coalesce(p_goal->>'horizon', '')
  );

  return v_client_id;
end;
$$;

grant execute on function public.create_client_bundle(jsonb, jsonb, jsonb, jsonb, uuid, jsonb) to authenticated;
revoke execute on function public.create_client_bundle(jsonb, jsonb, jsonb, jsonb, uuid, jsonb) from public, anon;
