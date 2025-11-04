create or replace function public.is_admin()
returns boolean
language sql
security definer
-- Always set search_path to an empty value to prevent hijacking.
-- See https://www.postgresql.org/docs/current/sql-createfunction.html
set search_path = ''
stable
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
