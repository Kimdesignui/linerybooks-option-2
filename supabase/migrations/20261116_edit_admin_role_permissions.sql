begin;

create or replace function public.admin_set_role_permission(p_role text, p_permission_key text, p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_role text := lower(trim(coalesce(p_role, '')));
  normalized_permission text := lower(trim(coalesce(p_permission_key, '')));
begin
  if not public.admin_has_permission('admin_users.manage') then
    raise exception 'PERMISSION_REQUIRED:admin_users.manage';
  end if;
  if normalized_role = 'super_admin' then
    raise exception 'SUPER_ADMIN_MATRIX_LOCKED';
  end if;
  if not exists (select 1 from public.admin_roles where role_key = normalized_role) then
    raise exception 'INVALID_ADMIN_ROLE';
  end if;
  if not exists (select 1 from public.admin_permissions where permission_key = normalized_permission) then
    raise exception 'INVALID_ADMIN_PERMISSION';
  end if;
  if p_enabled then
    insert into public.admin_role_permissions (role_key, permission_key)
    values (normalized_role, normalized_permission)
    on conflict do nothing;
  else
    delete from public.admin_role_permissions
    where role_key = normalized_role and permission_key = normalized_permission;
  end if;
end;
$$;

revoke all on function public.admin_set_role_permission(text, text, boolean) from public;
grant execute on function public.admin_set_role_permission(text, text, boolean) to authenticated;

commit;
