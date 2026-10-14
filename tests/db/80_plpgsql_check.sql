-- Static validation of every PL/pgSQL function in public (runs as
-- supabase_admin). PL/pgSQL resolves column references only at run time, so
-- a reference to a column that does not exist (the 2026-10-14
-- complete_coaching_session fault) passes the migration and fails the first
-- real call. plpgsql_check finds it without executing anything.

create extension if not exists plpgsql_check;

do $$
declare
  v_errors text;
  v_checked int;
begin
  select count(*) into v_checked
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace join pg_language l on l.oid = p.prolang
  where n.nspname = 'public' and l.lanname = 'plpgsql';

  select string_agg(format('%s: %s', p.proname, r.message), '; ' order by p.proname)
  into v_errors
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  join pg_language l on l.oid = p.prolang
  cross join lateral plpgsql_check_function_tb(
    p.oid,
    coalesce((select t.tgrelid from pg_trigger t where t.tgfoid = p.oid limit 1), 0::oid),
    fatal_errors => false, other_warnings => false, extra_warnings => false, performance_warnings => false
  ) r
  where n.nspname = 'public' and l.lanname = 'plpgsql' and p.prorettype <> 'event_trigger'::regtype
    and r.level = 'error';

  if v_errors is not null then
    raise exception 'FAIL plpgsql_check: %', v_errors;
  end if;
  if v_checked < 40 then
    raise exception 'FAIL only % PL/pgSQL functions found', v_checked;
  end if;
  raise notice 'ok - % PL/pgSQL functions pass plpgsql_check', v_checked;
end $$;
