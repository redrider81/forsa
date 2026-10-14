-- The test database must carry production's default privileges; otherwise
-- every privilege test below proves nothing. Values as read from
-- pg_default_acl in production (role postgres, schema public).

do $$
declare
  v_tables text;
  v_functions text;
  v_sequences text;
begin
  select defaclacl::text into v_tables from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace
  where n.nspname = 'public' and pg_get_userbyid(d.defaclrole) = 'postgres' and d.defaclobjtype = 'r';
  select defaclacl::text into v_functions from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace
  where n.nspname = 'public' and pg_get_userbyid(d.defaclrole) = 'postgres' and d.defaclobjtype = 'f';
  select defaclacl::text into v_sequences from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace
  where n.nspname = 'public' and pg_get_userbyid(d.defaclrole) = 'postgres' and d.defaclobjtype = 'S';

  if v_tables is distinct from '{postgres=arwdDxtm/postgres,anon=Dxtm/postgres,authenticated=Dxtm/postgres,service_role=Dxtm/postgres}' then
    raise exception 'FAIL table default privileges differ from production: %', v_tables;
  end if;
  if v_functions is distinct from '{postgres=X/postgres}' then
    raise exception 'FAIL function default privileges differ from production: %', v_functions;
  end if;
  if v_sequences is distinct from '{postgres=rwU/postgres}' then
    raise exception 'FAIL sequence default privileges differ from production: %', v_sequences;
  end if;
  raise notice 'ok - default privileges match production';
end $$;
