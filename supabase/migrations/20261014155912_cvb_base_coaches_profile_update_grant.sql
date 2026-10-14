-- CVB Base — missing base privilege for the coach's own profile edit.
-- 20260826140000_cvb_base_coaches_update_self created the RLS policy
-- coaches_update_self, but public.coaches only ever had SELECT for
-- authenticated (20260824092552). The profile save in
-- src/app/api/portal/profile/route.ts was refused with 42501 before RLS was
-- evaluated ("permission denied for table coaches" in production).
--
-- Least privilege: exactly the four columns the route writes. The existing
-- policy keeps every coach restricted to their own row; a client's
-- current_coach_id() is null, so no client row ever matches. id, initials,
-- email and created_at stay read-only. Nothing is granted to anon or public.

grant update (name, title, credential, focus) on table public.coaches to authenticated;
