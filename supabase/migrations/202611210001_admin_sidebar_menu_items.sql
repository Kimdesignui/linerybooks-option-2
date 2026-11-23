begin;

create table if not exists public.admin_sidebar_menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_key text not null unique,
  label text not null,
  href text not null default '/admin',
  icon text not null default 'bi-circle',
  section text not null default 'Hệ thống',
  parent_key text references public.admin_sidebar_menu_items(menu_key) on delete cascade,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_group boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_sidebar_menu_items_order_idx
  on public.admin_sidebar_menu_items(section, parent_key, sort_order);

alter table public.admin_sidebar_menu_items enable row level security;

drop policy if exists "admins read sidebar menu" on public.admin_sidebar_menu_items;
create policy "admins read sidebar menu" on public.admin_sidebar_menu_items
  for select using (public.is_admin());

drop policy if exists "super admins manage sidebar menu" on public.admin_sidebar_menu_items;
create policy "super admins manage sidebar menu" on public.admin_sidebar_menu_items
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'super_admin'));

insert into public.admin_sidebar_menu_items (menu_key, label, href, icon, section, parent_key, sort_order, is_group)
values
  ('dashboard', 'Tổng quan', '/admin', 'bi-grid-1x2-fill', 'Khu vực quản trị', null, 10, false),
  ('books-new', 'Thêm sách', '/admin/books/new', 'bi-plus-square', 'Quản lý sách', null, 20, false),
  ('books-list', 'Danh sách sách', '/admin/books', 'bi-book', 'Quản lý sách', null, 21, false),
  ('books-categories', 'Danh mục', '/admin/books/categories', 'bi-tags', 'Quản lý sách', null, 22, false),
  ('books-formats', 'Khổ sách', '/admin/books/formats', 'bi-rulers', 'Quản lý sách', null, 23, false),
  ('books-home-modules', 'Mô đun sách trang chủ', '/admin/collections', 'bi-collection', 'Quản lý sách', null, 24, false),
  ('sales-orders', 'Đơn hàng', '/admin/orders', 'bi-bag', 'Bán hàng', null, 30, false),
  ('sales-reports', 'Báo cáo & thống kê', '/admin/reports', 'bi-bar-chart-line', 'Bán hàng', null, 31, false),
  ('sales-customers', 'Khách hàng', '/admin/customers', 'bi-person-lines-fill', 'Bán hàng', null, 32, false),
  ('sales-stores', 'Điểm bán và kho', '/admin/stores', 'bi-shop', 'Bán hàng', null, 33, false),
  ('sales-inventory', 'Quản lý kho', '/admin/inventory', 'bi-box-seam', 'Bán hàng', null, 34, false),
  ('sales-promotions', 'Chương trình khuyến mãi', '/admin/promotions', 'bi-ticket-perforated', 'Bán hàng', null, 35, false),
  ('content-creators', 'Creators', '/admin/authors', 'bi-people', 'Nội dung', null, 40, false),
  ('content-publishers', 'Nhà xuất bản', '/admin/publishers', 'bi-building', 'Nội dung', null, 41, false),
  ('content-news', 'Tin tức', '/admin/news', 'bi-newspaper', 'Nội dung', null, 42, false),
  ('content-reviews', 'Bình luận & đánh giá', '/admin/reviews', 'bi-chat-square-text', 'Nội dung', null, 43, false),
  ('content-media', 'Media', '/admin/media', 'bi-images', 'Nội dung', null, 44, false),
  ('system-activity', 'Lịch sử thao tác', '/admin/activity-log', 'bi-clock-history', 'Hệ thống', null, 50, false),
  ('system-storefront-menu', 'Quản lý Menu trang người dùng', '/admin/menus', 'bi-list-nested', 'Hệ thống', null, 51, false),
  ('system-website', 'Website & footer', '/admin/website', 'bi-window', 'Hệ thống', null, 52, false),
  ('system-locations', 'Địa điểm', '/admin/locations', 'bi-geo-alt', 'Hệ thống', null, 53, false),
  ('system-payments', 'Thanh toán', '/admin/payments', 'bi-credit-card', 'Hệ thống', null, 54, false),
  ('system-chatbot', 'Gemini chatbot', '/admin/chatbot', 'bi-chat-dots', 'Hệ thống', null, 55, false),
  ('system-settings', 'Cài đặt', '/admin/settings', 'bi-sliders', 'Hệ thống', null, 56, false),
  ('config-admin-menu', 'Menu quản trị', '/admin/settings/admin-menu', 'bi-layout-sidebar-inset', 'Cấu hình', null, 59, false),
  ('security', 'Quản trị viên & phân quyền', '#', 'bi-person-gear', 'Cấu hình', null, 60, true),
  ('security-admins', 'Quản trị viên', '/admin/settings/admin-users', 'bi-person-gear', 'Cấu hình', 'security', 61, false),
  ('security-permissions', 'Phân quyền', '/admin/settings/permissions', 'bi-shield-check', 'Cấu hình', 'security', 62, false)
on conflict (menu_key) do update set label = excluded.label, href = excluded.href, icon = excluded.icon, section = excluded.section, parent_key = excluded.parent_key, sort_order = excluded.sort_order, is_group = excluded.is_group;

commit;
