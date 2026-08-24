-- CVB Base — missing base table privileges for the `authenticated` role.
-- RLS policies were created in earlier migrations but never accompanied by
-- the underlying GRANTs they restrict. Without a base grant, PostgREST
-- denies access before RLS is even evaluated, which surfaced as: Supabase
-- credential validation succeeding but the app's own profile lookup failing
-- with a masked permission error, indistinguishable from "no profile found".

grant select on table
  public.profiles,
  public.coaches,
  public.organisations,
  public.commitments,
  public.documents,
  public.insights,
  public.session_summaries
to authenticated;

grant select, insert, update, delete on table
  public.clients,
  public.coaching_agreements,
  public.development_goals,
  public.engagements,
  public.milestones,
  public.sessions,
  public.session_coach_notes,
  public.session_preparations,
  public.materials
to authenticated;

grant select, insert, delete
on table public.reflections
to authenticated;

-- public.intakes intentionally receives no grant in this pass.
