-- Owner-only management of existing Supabase Auth accounts.
-- An account must exist in Auth first; this migration only grants or changes
-- its admin role and never stores a password in the public database.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Bootstrap the requested owner account by email. The password remains managed
-- by Supabase Auth and is never stored in this migration.
insert into public.admin_users (user_id, role)
select id, 'owner'
from auth.users
where lower(email) = 'pt.thietke@gmail.com'
on conflict (user_id) do update set role = 'owner';

create or replace function public.admin_list_admin_users()
returns table(user_id uuid, email text, role text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid() and admin_users.role = 'owner'
  ) then
    raise exception 'OWNER_REQUIRED';
  end if;

  return query
  select au.user_id, u.email::text, au.role, au.created_at
  from public.admin_users au
  join auth.users u on u.id = au.user_id
  order by au.created_at asc;
end;
$$;

create or replace function public.admin_grant_admin(p_email text, p_role text default 'editor')
returns table(user_id uuid, email text, role text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  normalized_email text := lower(trim(coalesce(p_email, '')));
  normalized_role text := lower(trim(coalesce(p_role, 'editor')));
begin
  if not exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid() and admin_users.role = 'owner'
  ) then
    raise exception 'OWNER_REQUIRED';
  end if;

  if normalized_email = '' then raise exception 'EMAIL_REQUIRED'; end if;
  if normalized_role not in ('owner', 'editor') then raise exception 'INVALID_ADMIN_ROLE'; end if;

  select id into target_user_id
  from auth.users
  where lower(email) = normalized_email
  limit 1;

  if target_user_id is null then raise exception 'AUTH_USER_NOT_FOUND'; end if;

  insert into public.admin_users (user_id, role)
  values (target_user_id, normalized_role)
  on conflict (user_id) do update set role = excluded.role;

  return query
  select au.user_id, u.email::text, au.role, au.created_at
  from public.admin_users au
  join auth.users u on u.id = au.user_id
  where au.user_id = target_user_id;
end;
$$;

create or replace function public.admin_revoke_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid() and admin_users.role = 'owner'
  ) then
    raise exception 'OWNER_REQUIRED';
  end if;

  if p_user_id = auth.uid() then raise exception 'CANNOT_REVOKE_SELF'; end if;
  delete from public.admin_users where user_id = p_user_id;
end;
$$;

revoke all on function public.admin_list_admin_users() from public;
revoke all on function public.admin_grant_admin(text, text) from public;
revoke all on function public.admin_revoke_admin(uuid) from public;
grant execute on function public.admin_list_admin_users() to authenticated;
grant execute on function public.admin_grant_admin(text, text) to authenticated;
grant execute on function public.admin_revoke_admin(uuid) to authenticated;
