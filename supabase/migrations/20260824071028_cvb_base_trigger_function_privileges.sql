-- CVB Base — handle_new_auth_user is a trigger function (invoked
-- automatically on auth.users insert, under its own SECURITY DEFINER
-- privileges) and is never meant to be called directly as an RPC. It would
-- already fail if invoked directly (it reads the trigger-only NEW record),
-- but revoke EXECUTE from PUBLIC/anon/authenticated for defense in depth,
-- matching the other internal helper functions in this schema.

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
