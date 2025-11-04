create or replace function public.is_admin()
returns boolean
language sql
security invoker
stable
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
