-- Matches the defense-in-depth convention established in
-- cvb_base_function_privileges: revoke the implicit PUBLIC/anon EXECUTE
-- grant Postgres applies to every newly created function, leaving only the
-- explicit `authenticated` grant already issued in the client-creation
-- migration.

revoke execute on function public.create_client_bundle(jsonb, jsonb, uuid, jsonb) from public, anon;
