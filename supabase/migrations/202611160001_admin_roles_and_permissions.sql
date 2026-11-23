begin;

-- Role-based access control (RBAC) for the admin workspace.
create table if not exists public.admin_roles (
  role_key text primary key,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_permissions (
  permission_key text primary key,
  name text not null,
  group_name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_role_permissions (
  role_key text not null references public.admin_roles(role_key) on delete cascade,
  permission_key text not null references public.admin_permissions(permission_key) on delete cascade,
  primary key (role_key, permission_key)
);

alter table public.admin_users drop constraint if exists admin_users_role_check;
update public.admin_users set role = 'super_admin' where role = 'owner';
alter table public.admin_users alter column role set default 'editor';
alter table public.admin_users add constraint admin_users_role_check check (role in ('super_admin', 'system_admin', 'sales_staff', 'editor'));

insert into public.admin_roles (role_key, name, description, sort_order)
values
  ('super_admin', 'Super Admin', 'Toàn quyền trên toàn bộ khu vực quản trị và quản trị viên.', 1),
  ('system_admin', 'Admin quản trị hệ thống', 'Quản lý cấu hình, catalog, nội dung hệ thống và vận hành backend.', 2),
  ('sales_staff', 'Nhân viên kinh doanh', 'Theo dõi sách, đơn hàng, khách hàng, kho và báo cáo bán hàng.', 3),
  ('editor', 'Biên tập viên', 'Soạn nội dung, tác giả, media, mô đun trang chủ và kiểm duyệt đánh giá.', 4)
on conflict (role_key) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.admin_permissions (permission_key, name, group_name, description, sort_order)
values
  ('dashboard.view', 'Xem tổng quan', 'Bảng điều khiển', 'Xem dashboard vận hành.', 1),
  ('books.view', 'Xem sách', 'Catalog', 'Xem danh sách và chi tiết sách.', 10),
  ('books.create', 'Tạo sách', 'Catalog', 'Tạo sách mới và nhập sách.', 11),
  ('books.update', 'Sửa sách', 'Catalog', 'Cập nhật thông tin, giá và tồn kho sách.', 12),
  ('books.delete', 'Xóa sách', 'Catalog', 'Xóa bản ghi sách.', 13),
  ('taxonomy.manage', 'Quản lý phân loại', 'Catalog', 'Quản lý danh mục, thể loại, chủ đề, dòng sách và metadata.', 14),
  ('authors.manage', 'Quản lý tác giả', 'Nội dung', 'Quản lý tác giả, dịch giả và họa sĩ.', 20),
  ('news.manage', 'Quản lý tin tức', 'Nội dung', 'Soạn, sửa, xem trước và xuất bản tin/eMagazine.', 21),
  ('homepage.manage', 'Quản lý trang chủ', 'Nội dung', 'Quản lý mô đun và sách hiển thị trên trang chủ.', 22),
  ('media.manage', 'Quản lý media', 'Nội dung', 'Quản lý ảnh, logo, banner và tài nguyên media.', 23),
  ('reviews.moderate', 'Kiểm duyệt đánh giá', 'Nội dung', 'Duyệt hoặc từ chối bình luận và đánh giá.', 24),
  ('orders.manage', 'Quản lý đơn hàng', 'Bán hàng', 'Xem đơn hàng và cập nhật trạng thái xử lý.', 30),
  ('customers.view', 'Xem khách hàng', 'Bán hàng', 'Xem hồ sơ và lịch sử khách hàng.', 31),
  ('inventory.manage', 'Quản lý kho', 'Bán hàng', 'Theo dõi và điều chỉnh tồn kho.', 32),
  ('promotions.manage', 'Quản lý khuyến mãi', 'Bán hàng', 'Tạo và cập nhật chương trình khuyến mãi.', 33),
  ('reports.view', 'Xem báo cáo', 'Bán hàng', 'Xem báo cáo doanh thu và sản phẩm bán chạy.', 34),
  ('website.manage', 'Quản lý website', 'Hệ thống', 'Quản lý menu, footer, cấu hình website và chính sách.', 40),
  ('locations.manage', 'Quản lý địa điểm', 'Hệ thống', 'Quản lý điểm bán, kho và vùng giao hàng.', 41),
  ('payments.manage', 'Quản lý thanh toán', 'Hệ thống', 'Quản lý phương thức thanh toán.', 42),
  ('chatbot.manage', 'Quản lý chatbot', 'Hệ thống', 'Quản lý prompt và cấu hình chatbot.', 43),
  ('imports.manage', 'Quản lý nhập dữ liệu', 'Hệ thống', 'Xem lịch sử và vận hành nhập Excel.', 44),
  ('admin_users.manage', 'Quản lý quản trị viên', 'Bảo mật', 'Gán vai trò, đổi vai trò và gỡ quyền quản trị.', 50)
on conflict (permission_key) do update set name = excluded.name, group_name = excluded.group_name, description = excluded.description, sort_order = excluded.sort_order;

-- Super Admin receives the complete matrix.
insert into public.admin_role_permissions (role_key, permission_key)
select 'super_admin', permission_key from public.admin_permissions
on conflict do nothing;

-- System administration role.
insert into public.admin_role_permissions (role_key, permission_key)
select 'system_admin', permission_key from public.admin_permissions
where permission_key in (
  'dashboard.view', 'books.view', 'books.create', 'books.update', 'books.delete', 'taxonomy.manage',
  'authors.manage', 'homepage.manage', 'media.manage', 'website.manage', 'locations.manage',
  'payments.manage', 'chatbot.manage', 'imports.manage'
)
on conflict do nothing;

-- Sales role.
insert into public.admin_role_permissions (role_key, permission_key)
select 'sales_staff', permission_key from public.admin_permissions
where permission_key in ('dashboard.view', 'books.view', 'orders.manage', 'customers.view', 'inventory.manage', 'promotions.manage', 'reports.view')
on conflict do nothing;

-- Editorial role.
insert into public.admin_role_permissions (role_key, permission_key)
select 'editor', permission_key from public.admin_permissions
where permission_key in ('dashboard.view', 'books.view', 'authors.manage', 'news.manage', 'homepage.manage', 'media.manage', 'reviews.moderate')
on conflict do nothing;

alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;

create or replace function public.admin_has_permission(p_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    join public.admin_role_permissions arp on arp.role_key = au.role
    where au.user_id = auth.uid()
      and arp.permission_key = lower(trim(coalesce(p_permission_key, '')))
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.admin_get_my_access()
returns table(role_key text, role_name text, permissions text[])
language sql
stable
security definer
set search_path = public
as $$
  select au.role, ar.name, coalesce(array_agg(arp.permission_key order by ap.sort_order), '{}'::text[])
  from public.admin_users au
  join public.admin_roles ar on ar.role_key = au.role
  left join public.admin_role_permissions arp on arp.role_key = au.role
  left join public.admin_permissions ap on ap.permission_key = arp.permission_key
  where au.user_id = auth.uid()
  group by au.role, ar.name;
$$;

create or replace function public.admin_list_admin_roles()
returns table(role_key text, name text, description text, sort_order integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_has_permission('admin_users.manage') then raise exception 'PERMISSION_REQUIRED:admin_users.manage'; end if;
  return query select ar.role_key, ar.name, ar.description, ar.sort_order from public.admin_roles ar order by ar.sort_order;
end;
$$;

create or replace function public.admin_list_role_permissions()
returns table(role_key text, role_name text, permission_key text, permission_name text, group_name text, permission_description text, sort_order integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_has_permission('admin_users.manage') then raise exception 'PERMISSION_REQUIRED:admin_users.manage'; end if;
  return query
  select ar.role_key, ar.name, ap.permission_key, ap.name, ap.group_name, ap.description, ap.sort_order
  from public.admin_roles ar
  join public.admin_role_permissions arp on arp.role_key = ar.role_key
  join public.admin_permissions ap on ap.permission_key = arp.permission_key
  order by ar.sort_order, ap.sort_order;
end;
$$;

drop function if exists public.admin_list_admin_users();
create or replace function public.admin_list_admin_users()
returns table(user_id uuid, email text, role text, role_name text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_has_permission('admin_users.manage') then raise exception 'PERMISSION_REQUIRED:admin_users.manage'; end if;
  return query
  select au.user_id, u.email::text, au.role, ar.name, au.created_at
  from public.admin_users au
  join auth.users u on u.id = au.user_id
  join public.admin_roles ar on ar.role_key = au.role
  order by au.created_at asc;
end;
$$;

drop function if exists public.admin_grant_admin(text, text);
create or replace function public.admin_grant_admin(p_email text, p_role text default 'editor')
returns table(user_id uuid, email text, role text, role_name text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  normalized_email text := lower(trim(coalesce(p_email, '')));
  normalized_role text := lower(trim(coalesce(p_role, 'editor')));
begin
  if not public.admin_has_permission('admin_users.manage') then raise exception 'PERMISSION_REQUIRED:admin_users.manage'; end if;
  if normalized_email = '' then raise exception 'EMAIL_REQUIRED'; end if;
  if not exists (select 1 from public.admin_roles where admin_roles.role_key = normalized_role) then raise exception 'INVALID_ADMIN_ROLE'; end if;
  select id into target_user_id from auth.users where lower(email) = normalized_email limit 1;
  if target_user_id is null then raise exception 'AUTH_USER_NOT_FOUND'; end if;
  if target_user_id = auth.uid() and normalized_role <> (select role from public.admin_users where user_id = auth.uid()) then raise exception 'CANNOT_CHANGE_SELF'; end if;
  insert into public.admin_users (user_id, role) values (target_user_id, normalized_role)
  on conflict (user_id) do update set role = excluded.role;
  return query
  select au.user_id, u.email::text, au.role, ar.name, au.created_at
  from public.admin_users au join auth.users u on u.id = au.user_id join public.admin_roles ar on ar.role_key = au.role
  where au.user_id = target_user_id;
end;
$$;

create or replace function public.admin_set_admin_role(p_user_id uuid, p_role text)
returns table(user_id uuid, email text, role text, role_name text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_role text := lower(trim(coalesce(p_role, '')));
begin
  if not public.admin_has_permission('admin_users.manage') then raise exception 'PERMISSION_REQUIRED:admin_users.manage'; end if;
  if p_user_id = auth.uid() then raise exception 'CANNOT_CHANGE_SELF'; end if;
  if not exists (select 1 from public.admin_roles where admin_roles.role_key = normalized_role) then raise exception 'INVALID_ADMIN_ROLE'; end if;
  update public.admin_users set role = normalized_role where admin_users.user_id = p_user_id;
  return query
  select au.user_id, u.email::text, au.role, ar.name, au.created_at
  from public.admin_users au join auth.users u on u.id = au.user_id join public.admin_roles ar on ar.role_key = au.role
  where au.user_id = p_user_id;
end;
$$;

create or replace function public.admin_revoke_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_has_permission('admin_users.manage') then raise exception 'PERMISSION_REQUIRED:admin_users.manage'; end if;
  if p_user_id = auth.uid() then raise exception 'CANNOT_REVOKE_SELF'; end if;
  delete from public.admin_users where user_id = p_user_id;
end;
$$;

revoke all on function public.admin_has_permission(text) from public;
revoke all on function public.admin_get_my_access() from public;
revoke all on function public.admin_list_admin_roles() from public;
revoke all on function public.admin_list_role_permissions() from public;
revoke all on function public.admin_list_admin_users() from public;
revoke all on function public.admin_grant_admin(text, text) from public;
revoke all on function public.admin_set_admin_role(uuid, text) from public;
revoke all on function public.admin_revoke_admin(uuid) from public;
grant execute on function public.admin_has_permission(text) to anon, authenticated;
grant execute on function public.admin_get_my_access() to authenticated;
grant execute on function public.admin_list_admin_roles() to authenticated;
grant execute on function public.admin_list_role_permissions() to authenticated;
grant execute on function public.admin_list_admin_users() to authenticated;
grant execute on function public.admin_grant_admin(text, text) to authenticated;
grant execute on function public.admin_set_admin_role(uuid, text) to authenticated;
grant execute on function public.admin_revoke_admin(uuid) to authenticated;

commit;
