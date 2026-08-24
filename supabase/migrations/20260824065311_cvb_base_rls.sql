-- CVB Base — row level security.
-- Coach access resolves through engagements.coach_id ownership. Klient access
-- resolves through profiles.client_id = own row. Least privilege throughout:
-- no `USING (true)` policies, no write capability that doesn't already exist
-- as a route in the application today.

-- ---------------------------------------------------------------- helpers

create or replace function public.current_coach_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coach_id from public.profiles where id = auth.uid() and role = 'coach';
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.profiles where id = auth.uid() and role = 'klient';
$$;

create or replace function public.client_owned_by_current_coach(p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    join public.engagements e on e.id = c.engagement_id
    where c.id = p_client_id and e.coach_id = public.current_coach_id()
  );
$$;

create or replace function public.session_owned_by_current_coach(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sessions s
    where s.id = p_session_id and public.client_owned_by_current_coach(s.client_id)
  );
$$;

-- ---------------------------------------------------------------- enable RLS

alter table public.profiles enable row level security;
alter table public.coaches enable row level security;
alter table public.organisations enable row level security;
alter table public.engagements enable row level security;
alter table public.milestones enable row level security;
alter table public.clients enable row level security;
alter table public.coaching_agreements enable row level security;
alter table public.development_goals enable row level security;
alter table public.sessions enable row level security;
alter table public.session_coach_notes enable row level security;
alter table public.session_summaries enable row level security;
alter table public.session_preparations enable row level security;
alter table public.reflections enable row level security;
alter table public.insights enable row level security;
alter table public.commitments enable row level security;
alter table public.documents enable row level security;
alter table public.materials enable row level security;
alter table public.intakes enable row level security;

-- ---------------------------------------------------------------- profiles

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- No insert/update/delete policies: rows are created by the
-- handle_new_auth_user trigger and managed via service role only.

-- ---------------------------------------------------------------- coaches

create policy coaches_select_self on public.coaches
  for select to authenticated
  using (id = public.current_coach_id());

create policy coaches_select_by_klient on public.coaches
  for select to authenticated
  using (
    id in (
      select e.coach_id
      from public.clients c
      join public.engagements e on e.id = c.engagement_id
      where c.id = public.current_client_id()
    )
  );

-- ------------------------------------------------------------ organisations

create policy organisations_select_coach on public.organisations
  for select to authenticated
  using (
    id in (select e.organisation_id from public.engagements e where e.coach_id = public.current_coach_id())
  );

create policy organisations_select_klient on public.organisations
  for select to authenticated
  using (
    id in (select c.organisation_id from public.clients c where c.id = public.current_client_id())
  );

-- -------------------------------------------------------------- engagements

create policy engagements_select_coach on public.engagements
  for select to authenticated
  using (coach_id = public.current_coach_id());

create policy engagements_select_klient on public.engagements
  for select to authenticated
  using (id in (select c.engagement_id from public.clients c where c.id = public.current_client_id()));

create policy engagements_write_coach on public.engagements
  for all to authenticated
  using (coach_id = public.current_coach_id())
  with check (coach_id = public.current_coach_id());

-- --------------------------------------------------------------- milestones

create policy milestones_select_coach on public.milestones
  for select to authenticated
  using (engagement_id in (select e.id from public.engagements e where e.coach_id = public.current_coach_id()));

create policy milestones_select_klient on public.milestones
  for select to authenticated
  using (engagement_id in (select c.engagement_id from public.clients c where c.id = public.current_client_id()));

create policy milestones_write_coach on public.milestones
  for all to authenticated
  using (engagement_id in (select e.id from public.engagements e where e.coach_id = public.current_coach_id()))
  with check (engagement_id in (select e.id from public.engagements e where e.coach_id = public.current_coach_id()));

-- ------------------------------------------------------------------ clients

create policy clients_select_coach on public.clients
  for select to authenticated
  using (public.client_owned_by_current_coach(id));

create policy clients_select_klient on public.clients
  for select to authenticated
  using (id = public.current_client_id());

create policy clients_write_coach on public.clients
  for all to authenticated
  using (public.client_owned_by_current_coach(id))
  with check (engagement_id in (select e.id from public.engagements e where e.coach_id = public.current_coach_id()));

-- No direct UPDATE policy for klient: self-service profile edits are
-- restricted to name/role/email/phone via the update_own_client_profile RPC
-- below, so column-level confidentiality doesn't depend on trusting the
-- request body.

-- --------------------------------------------------------- coaching_agreements

create policy coaching_agreements_select_coach on public.coaching_agreements
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy coaching_agreements_select_klient on public.coaching_agreements
  for select to authenticated
  using (client_id = public.current_client_id());

create policy coaching_agreements_write_coach on public.coaching_agreements
  for all to authenticated
  using (public.client_owned_by_current_coach(client_id))
  with check (public.client_owned_by_current_coach(client_id));

-- ----------------------------------------------------------- development_goals

create policy development_goals_select_coach on public.development_goals
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy development_goals_select_klient on public.development_goals
  for select to authenticated
  using (client_id = public.current_client_id());

create policy development_goals_write_coach on public.development_goals
  for all to authenticated
  using (public.client_owned_by_current_coach(client_id))
  with check (public.client_owned_by_current_coach(client_id));

-- ------------------------------------------------------------------ sessions

create policy sessions_select_coach on public.sessions
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy sessions_select_klient on public.sessions
  for select to authenticated
  using (client_id = public.current_client_id());

create policy sessions_write_coach on public.sessions
  for all to authenticated
  using (public.client_owned_by_current_coach(client_id))
  with check (public.client_owned_by_current_coach(client_id));

-- ----------------------------------------------------------- session_coach_notes
-- Coach-only. No klient policy exists on this table at all — not a filtered
-- view, zero grant.

create policy session_coach_notes_all_coach on public.session_coach_notes
  for all to authenticated
  using (coach_id = public.current_coach_id() and public.session_owned_by_current_coach(session_id))
  with check (coach_id = public.current_coach_id() and public.session_owned_by_current_coach(session_id));

-- ------------------------------------------------------------ session_summaries
-- Read-only in this pass: no route in the application writes session
-- summaries yet (out of scope — AI-assisted drafting/approval is a separate
-- feature). Writes go through service role only until that flow exists.

create policy session_summaries_select_coach on public.session_summaries
  for select to authenticated
  using (public.session_owned_by_current_coach(session_id));

create policy session_summaries_select_klient on public.session_summaries
  for select to authenticated
  using (
    approved = true
    and session_id in (select s.id from public.sessions s where s.client_id = public.current_client_id())
  );

-- --------------------------------------------------------- session_preparations

create policy session_preparations_select_coach on public.session_preparations
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy session_preparations_all_klient on public.session_preparations
  for all to authenticated
  using (client_id = public.current_client_id())
  with check (client_id = public.current_client_id());

-- ------------------------------------------------------------------ reflections

create policy reflections_select_coach on public.reflections
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy reflections_select_klient on public.reflections
  for select to authenticated
  using (client_id = public.current_client_id());

create policy reflections_insert_klient on public.reflections
  for insert to authenticated
  with check (client_id = public.current_client_id());

create policy reflections_delete_klient on public.reflections
  for delete to authenticated
  using (client_id = public.current_client_id());

-- ---------------------------------------------------------------------- insights
-- Read-only in this pass: no route writes insights today.

create policy insights_select_coach on public.insights
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy insights_select_klient on public.insights
  for select to authenticated
  using (client_id = public.current_client_id());

-- ------------------------------------------------------------------- commitments

create policy commitments_select_coach on public.commitments
  for select to authenticated
  using (public.client_owned_by_current_coach(client_id));

create policy commitments_select_klient on public.commitments
  for select to authenticated
  using (client_id = public.current_client_id());

-- No direct UPDATE policy for klient: status/note changes are restricted to
-- the update_own_commitment_status RPC below (status, client_note,
-- completed_at only). No insert/delete policy for either role — no route
-- creates or deletes commitments today.

-- --------------------------------------------------------------------- documents
-- Read-only in this pass: no route writes documents today.

create policy documents_select_coach on public.documents
  for select to authenticated
  using (
    (owner_type = 'klient' and public.client_owned_by_current_coach(owner_id))
    or (owner_type = 'uppdrag' and owner_id in (
      select e.id from public.engagements e where e.coach_id = public.current_coach_id()
    ))
  );

create policy documents_select_klient on public.documents
  for select to authenticated
  using (
    visibility <> 'coach'
    and (
      (owner_type = 'klient' and owner_id = public.current_client_id())
      or (owner_type = 'uppdrag' and owner_id = (
        select c.engagement_id from public.clients c where c.id = public.current_client_id()
      ))
    )
  );

-- --------------------------------------------------------------------- materials

create policy materials_select_coach on public.materials
  for select to authenticated
  using (
    public.client_owned_by_current_coach(owner_client_id)
    and (sharing_level = 'shared_coach' or source = 'coach_shared')
  );

create policy materials_insert_coach on public.materials
  for insert to authenticated
  with check (
    public.client_owned_by_current_coach(owner_client_id)
    and created_by_role = 'coach'
    and source = 'coach_shared'
    and sharing_level = 'shared_coach'
  );

create policy materials_delete_coach on public.materials
  for delete to authenticated
  using (public.client_owned_by_current_coach(owner_client_id) and source = 'coach_shared');

create policy materials_all_klient on public.materials
  for select to authenticated
  using (owner_client_id = public.current_client_id());

create policy materials_insert_klient on public.materials
  for insert to authenticated
  with check (
    owner_client_id = public.current_client_id()
    and created_by_role = 'klient'
    and created_by_id = public.current_client_id()::text
    and source in ('client_upload', 'client_note')
  );

create policy materials_update_klient on public.materials
  for update to authenticated
  using (owner_client_id = public.current_client_id() and created_by_role = 'klient')
  with check (owner_client_id = public.current_client_id() and created_by_role = 'klient');

create policy materials_delete_klient on public.materials
  for delete to authenticated
  using (owner_client_id = public.current_client_id() and created_by_role = 'klient');

-- Identity columns on materials are immutable after insert regardless of
-- which policy allowed the update — the API routes never intend to change
-- these, this is a structural backstop.
create or replace function public.materials_lock_identity_columns()
returns trigger
language plpgsql
as $$
begin
  if new.owner_client_id <> old.owner_client_id
     or new.created_by_role <> old.created_by_role
     or new.created_by_id <> old.created_by_id
     or new.source <> old.source then
    raise exception 'materials: owner_client_id, created_by_role, created_by_id and source are immutable';
  end if;
  return new;
end;
$$;

create trigger materials_lock_identity
  before update on public.materials
  for each row execute function public.materials_lock_identity_columns();

-- ----------------------------------------------------------------------- intakes
-- RLS enabled, no policies for anon/authenticated in this pass. Writes are
-- service-role only until a website intake integration is built (out of
-- scope here).

-- --------------------------------------------------------------- self-service RPCs

create or replace function public.update_own_client_profile(
  p_name text,
  p_role text,
  p_email text,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid := public.current_client_id();
begin
  if v_client_id is null then
    raise exception 'not a klient session';
  end if;

  update public.clients
  set name = p_name, role = p_role, email = p_email, phone = p_phone, updated_at = now()
  where id = v_client_id;
end;
$$;

grant execute on function public.update_own_client_profile(text, text, text, text) to authenticated;

create or replace function public.update_own_commitment_status(
  p_commitment_id uuid,
  p_status public.commitment_status,
  p_client_note text,
  p_completed_at date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid := public.current_client_id();
begin
  if v_client_id is null then
    raise exception 'not a klient session';
  end if;

  update public.commitments
  set status = p_status,
      client_note = p_client_note,
      completed_at = p_completed_at,
      updated_at = now()
  where id = p_commitment_id and client_id = v_client_id;

  if not found then
    raise exception 'commitment not found for this klient';
  end if;
end;
$$;

grant execute on function public.update_own_commitment_status(uuid, public.commitment_status, text, date) to authenticated;
