-- Add a non-sensitive login identifier for admin accounts.
alter table public.admin_users
  add column if not exists username text;

-- Backfill the existing administrator only when its email-local part is still unique.
-- This keeps current email login working while giving legacy rows a safe username.
update public.admin_users au
set username = lower(split_part(u.email, '@', 1))
from auth.users u
where u.id = au.user_id
  and au.username is null
  and not exists (
    select 1
    from public.admin_users other
    where other.username is not null
      and lower(other.username) = lower(split_part(u.email, '@', 1))
  );

create unique index if not exists admin_users_username_lower_unique
  on public.admin_users (lower(username))
  where username is not null;

drop function if exists public.admin_list_admin_users();
create or replace function public.admin_list_admin_users()
returns table(user_id uuid, username text, email text, role text, role_name text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_has_permission('admin_users.manage') then raise exception 'PERMISSION_REQUIRED:admin_users.manage'; end if;
  return query
  select au.user_id, au.username, u.email::text, au.role, ar.name, au.created_at
  from public.admin_users au
  join auth.users u on u.id = au.user_id
  join public.admin_roles ar on ar.role_key = au.role
  order by au.created_at asc;
end;
$$;

create or replace function public.admin_resolve_username(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.email::text
  from public.admin_users au
  join auth.users u on u.id = au.user_id
  where lower(au.username) = lower(trim(coalesce(p_username, '')))
  limit 1;
$$;

revoke all on function public.admin_resolve_username(text) from public;
grant execute on function public.admin_resolve_username(text) to anon, authenticated;
grant execute on function public.admin_list_admin_users() to authenticated;
