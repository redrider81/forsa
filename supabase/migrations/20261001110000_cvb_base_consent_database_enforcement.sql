-- CVB Base — enforce the article 9 consent boundary in the database, not only
-- in the application read path.
--
-- Rule for client-authored, special-category-capable content (unchanged from
-- the application model, now enforced here as well):
--
--   the client always reads their own content;
--   the coach reads it only while the client has an ACTIVE consent AND the
--   content was written inside a consent window [granted_at, withdrawn_at).
--
-- (While no consent is active nothing client-authored is readable by the
-- coach: content from earlier windows is restricted after a withdrawal, and
-- content outside every window is private. With an active consent, content
-- from any window is readable again; content from a gap never is.)
--
-- Mechanism per source — the smallest correct database control:
--
--   reflections               whole row client-authored    -> restrictive RLS
--   commitments.client_note   one column in a coach row    -> column grants + read RPC
--   session_preparations      mixed client/coach columns   -> column grants + read RPC,
--                                                             write RPC for the client,
--                                                             follow_up authorship tracked
--   sessions.client_focus /   coach-authored (coach may    -> no coach read control; a
--   desired_outcome           always read her own text)       real write timestamp for
--                                                             AI eligibility
--
-- Nothing is backfilled: rows written before this migration have no
-- write timestamp / author and are treated as uncertain (excluded).

-- ------------------------------------------------- 1. helpers

-- True if p_ts lies inside one of the client's consent windows.
create or replace function public.special_category_window_covers(p_client_id uuid, p_ts timestamptz)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_ts is not null and exists (
    select 1 from public.special_category_consents s
    where s.client_id = p_client_id
      and s.granted_at <= p_ts
      and (s.withdrawn_at is null or p_ts < s.withdrawn_at)
  );
$$;

-- Whether the calling coach may read client-authored content written at
-- p_ts. Only meaningful for the owning coach; false for everyone else, so
-- it cannot be used to probe other clients' consent state.
create or replace function public.special_category_coach_may_read(p_client_id uuid, p_ts timestamptz)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.client_owned_by_current_coach(p_client_id)
    and exists (
      select 1 from public.special_category_consents
      where client_id = p_client_id and withdrawn_at is null
    )
    and public.special_category_window_covers(p_client_id, p_ts);
$$;

revoke execute on function public.special_category_window_covers(uuid, timestamptz) from public, anon, authenticated;
revoke execute on function public.special_category_coach_may_read(uuid, timestamptz) from public, anon;
-- Needed by the RLS policy below, which runs as the querying role.
grant execute on function public.special_category_coach_may_read(uuid, timestamptz) to authenticated;

-- ------------------------------------------------- 2. reflections: restrictive RLS
--
-- ANDed with the existing permissive policies: the client keeps reading
-- their own rows; the coach additionally needs the consent condition.

create policy reflections_special_category_boundary on public.reflections
  as restrictive
  for select to authenticated
  using (
    client_id = public.current_client_id()
    or public.special_category_coach_may_read(client_id, created_at)
  );

-- ------------------------------------------------- 3. commitments.client_note
--
-- The commitment itself is Carolina's; only the client's note is gated.
-- updated_at is written only by the client's own update_own_commitment_status.

revoke select on table public.commitments from authenticated;
grant select (
  id, client_id, session_id, date, text, due_label, status, completed_at, created_at, updated_at
) on table public.commitments to authenticated;

create or replace function public.read_commitment_client_notes()
returns table (commitment_id uuid, client_note text)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.client_note
  from public.commitments c
  where c.client_note is not null
    and (
      c.client_id = public.current_client_id()
      or public.special_category_coach_may_read(c.client_id, c.updated_at)
    );
$$;

-- ------------------------------------------------- 4. session_preparations
--
-- Client fields: focus, desired_outcome, changed — gated by client_saved_at.
-- follow_up is written by both parties (the client's form, the coach's
-- meeting workspace). Its author and write time are now tracked; a coach-
-- authored follow_up is always readable by the coach, a client-authored one
-- is gated like the other client fields. Rows from before this migration
-- have no author and count as client-authored (uncertain -> gated).

alter table public.session_preparations
  add column follow_up_author text check (follow_up_author in ('klient', 'coach')),
  add column follow_up_saved_at timestamptz;

create or replace function public.session_preparations_track_client_save()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_is_client boolean := public.current_client_id() is not null;
  v_follow_up_changed boolean :=
    (tg_op = 'INSERT' and coalesce(new.follow_up, '') <> '')
    or (tg_op = 'UPDATE' and new.follow_up is distinct from old.follow_up);
begin
  -- client_saved_at: only the client's own save moves it (unchanged rule).
  if v_is_client then
    new.client_saved_at := now();
  elsif tg_op = 'UPDATE' then
    new.client_saved_at := old.client_saved_at;
  else
    new.client_saved_at := null;
  end if;

  -- follow_up authorship: set by whoever actually changed the text.
  if v_follow_up_changed then
    new.follow_up_author := case when v_is_client then 'klient' else 'coach' end;
    new.follow_up_saved_at := now();
  elsif tg_op = 'UPDATE' then
    new.follow_up_author := old.follow_up_author;
    new.follow_up_saved_at := old.follow_up_saved_at;
  else
    new.follow_up_author := null;
    new.follow_up_saved_at := null;
  end if;
  return new;
end;
$$;

revoke select on table public.session_preparations from authenticated;
grant select (
  id, client_id, session_id, updated_at, client_saved_at, follow_up_author, follow_up_saved_at
) on table public.session_preparations to authenticated;

create or replace function public.read_session_preparations()
returns table (
  id uuid,
  client_id uuid,
  session_id uuid,
  focus text,
  desired_outcome text,
  changed text,
  follow_up text,
  updated_at timestamptz,
  client_saved_at timestamptz,
  follow_up_author text,
  follow_up_saved_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.client_id,
    p.session_id,
    case when v.client_fields then p.focus else '' end,
    case when v.client_fields then p.desired_outcome else '' end,
    case when v.client_fields then p.changed else '' end,
    case when v.follow_up then p.follow_up else '' end,
    p.updated_at,
    p.client_saved_at,
    p.follow_up_author,
    p.follow_up_saved_at
  from public.session_preparations p
  cross join lateral (
    select
      p.client_id = public.current_client_id() as own,
      public.client_owned_by_current_coach(p.client_id) as coach
  ) w
  cross join lateral (
    select
      w.own or public.special_category_coach_may_read(p.client_id, p.client_saved_at) as client_fields,
      w.own
        or (w.coach and p.follow_up_author = 'coach')
        or public.special_category_coach_may_read(p.client_id, p.follow_up_saved_at) as follow_up
  ) v
  where w.own or w.coach;
$$;

-- The client's own save. Replaces the direct upsert, which needed SELECT on
-- the protected columns for ON CONFLICT.
create or replace function public.save_own_session_preparation(
  p_focus text,
  p_desired_outcome text,
  p_changed text,
  p_follow_up text
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
    raise exception 'NOT_AUTHORIZED';
  end if;

  insert into public.session_preparations (client_id, focus, desired_outcome, changed, follow_up, updated_at)
  values (v_client_id, coalesce(p_focus, ''), coalesce(p_desired_outcome, ''), coalesce(p_changed, ''), coalesce(p_follow_up, ''), now())
  on conflict (client_id) do update
  set focus = excluded.focus,
      desired_outcome = excluded.desired_outcome,
      changed = excluded.changed,
      follow_up = excluded.follow_up,
      updated_at = excluded.updated_at;
end;
$$;

-- ------------------------------------------------- 5. sessions: real write time of the focus text

alter table public.sessions add column focus_written_at timestamptz;

create or replace function public.sessions_track_focus_written()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.focus_written_at := case
      when coalesce(new.client_focus, '') <> '' or coalesce(new.desired_outcome, '') <> '' then now()
      else null
    end;
  elsif new.client_focus is distinct from old.client_focus
     or new.desired_outcome is distinct from old.desired_outcome then
    new.focus_written_at := now();
  else
    -- Booking time, status and other metadata never move it.
    new.focus_written_at := old.focus_written_at;
  end if;
  return new;
end;
$$;

create trigger sessions_track_focus_written
  before insert or update on public.sessions
  for each row execute function public.sessions_track_focus_written();

revoke execute on function public.sessions_track_focus_written() from public, anon, authenticated;

-- ------------------------------------------------- 6. coach indicator without content
--
-- Count of client-authored items written outside every consent window.
-- Returns a number only; reads no text into the result.

create or replace function public.count_client_private_content(p_client_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case when not public.client_owned_by_current_coach(p_client_id) then 0 else (
    (select count(*) from public.reflections r
      where r.client_id = p_client_id and not public.special_category_window_covers(p_client_id, r.created_at))
    + (select count(*) from public.session_preparations p
      where p.client_id = p_client_id and p.client_saved_at is not null
        and not public.special_category_window_covers(p_client_id, p.client_saved_at))
    + (select count(*) from public.commitments c
      where c.client_id = p_client_id and c.client_note is not null
        and not public.special_category_window_covers(p_client_id, c.updated_at))
  )::integer end;
$$;

-- ------------------------------------------------- 7. privileges

grant execute on function public.read_commitment_client_notes() to authenticated;
grant execute on function public.read_session_preparations() to authenticated;
grant execute on function public.save_own_session_preparation(text, text, text, text) to authenticated;
grant execute on function public.count_client_private_content(uuid) to authenticated;
revoke execute on function public.read_commitment_client_notes() from public, anon;
revoke execute on function public.read_session_preparations() from public, anon;
revoke execute on function public.save_own_session_preparation(text, text, text, text) from public, anon;
revoke execute on function public.count_client_private_content(uuid) from public, anon;
