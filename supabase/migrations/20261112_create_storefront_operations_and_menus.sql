-- Linery storefront/backend handoff schema.
-- This migration keeps presentation data separate from transactional data so the
-- current demo UI can be replaced by Supabase queries without changing markup.

begin;

create table if not exists public.site_menus (
  id uuid primary key default gen_random_uuid(),
  menu_key text not null unique,
  name text not null,
  location text not null check (location in ('header', 'footer')),
  language text not null default 'en' check (language in ('en', 'vi')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.site_menus(id) on delete cascade,
  parent_id uuid references public.site_menu_items(id) on delete cascade,
  label text not null,
  href text not null,
  item_type text not null default 'link' check (item_type in ('link', 'collection', 'category', 'creator', 'external')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_menu_items_menu_order_idx
  on public.site_menu_items(menu_id, parent_id, sort_order);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  content_type text not null default 'news' check (content_type in ('news', 'emagazine')),
  status public.catalog_status not null default 'draft',
  published_at timestamptz,
  image_storage_path text,
  title_en text not null,
  title_vi text not null,
  kicker_en text,
  kicker_vi text,
  excerpt_en text,
  excerpt_vi text,
  body_en jsonb not null default '[]'::jsonb,
  body_vi jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_posts_public_listing_idx
  on public.news_posts(published_at desc nulls last, created_at desc)
  where status = 'active';

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null,
  language text not null default 'en' check (language in ('en', 'vi', 'all')),
  value_json jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (setting_key, language)
);

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  default_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_token text unique,
  currency text not null default 'VND',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_token is not null)
);

create unique index if not exists carts_user_unique_idx on public.carts(user_id) where user_id is not null;

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_vnd numeric(12,0) not null check (unit_price_vnd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, book_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  fulfillment_method text not null default 'delivery' check (fulfillment_method in ('pickup', 'delivery')),
  payment_method text,
  shipping_address jsonb not null default '{}'::jsonb,
  delivery_notes text,
  subtotal_vnd numeric(12,0) not null default 0,
  discount_vnd numeric(12,0) not null default 0,
  delivery_fee_vnd numeric(12,0) not null default 0,
  total_vnd numeric(12,0) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  isbn text,
  title_snapshot text not null,
  publisher_snapshot text,
  unit_price_vnd numeric(12,0) not null,
  quantity integer not null check (quantity > 0),
  line_total_vnd numeric(12,0) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_transaction_id text,
  amount_vnd numeric(12,0) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My wishlist',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.wishlist_items (
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wishlist_id, book_id)
);

create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  guest_name text,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  provider text,
  logo_storage_path text,
  sort_order integer not null default 0,
  config_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_menus enable row level security;
alter table public.site_menu_items enable row level security;
alter table public.news_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_payments enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.book_reviews enable row level security;
alter table public.payment_methods enable row level security;

drop policy if exists "public reads active menus" on public.site_menus;
create policy "public reads active menus" on public.site_menus for select using (is_active = true);
drop policy if exists "public reads active menu items" on public.site_menu_items;
create policy "public reads active menu items" on public.site_menu_items for select using (is_active = true);
drop policy if exists "public reads published news" on public.news_posts;
create policy "public reads published news" on public.news_posts for select using (status = 'active');
drop policy if exists "public reads public settings" on public.site_settings;
create policy "public reads public settings" on public.site_settings for select using (is_public = true);
drop policy if exists "public reads approved reviews" on public.book_reviews;
create policy "public reads approved reviews" on public.book_reviews for select using (status = 'approved');
drop policy if exists "public reads active payment methods" on public.payment_methods;
create policy "public reads active payment methods" on public.payment_methods for select using (is_active = true);

drop policy if exists "users manage own profile" on public.customer_profiles;
create policy "users manage own profile" on public.customer_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "users manage own carts" on public.carts;
create policy "users manage own carts" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users manage own cart items" on public.cart_items;
create policy "users manage own cart items" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "users read own order items" on public.order_items;
create policy "users read own order items" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "users read own payments" on public.order_payments;
create policy "users read own payments" on public.order_payments for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "users manage own wishlists" on public.wishlists;
create policy "users manage own wishlists" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users manage own wishlist items" on public.wishlist_items;
create policy "users manage own wishlist items" on public.wishlist_items for all using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())) with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));
drop policy if exists "users create reviews" on public.book_reviews;
create policy "users create reviews" on public.book_reviews for insert with check (auth.uid() = user_id or user_id is null);

insert into public.site_menus (menu_key, name, location, language)
values ('header-main', 'Header menu', 'header', 'en'), ('footer-main', 'Footer menu', 'footer', 'en')
on conflict (menu_key) do update set name = excluded.name, location = excluded.location;

insert into public.payment_methods (code, name, description, provider, sort_order, is_active)
values
  ('vnpay', 'VNPay - Wallet', 'Pay with your VNPay wallet.', 'vnpay', 1, false),
  ('momo', 'MoMo wallet', 'Pay securely with your MoMo wallet.', 'momo', 2, false),
  ('apple-pay', 'Apple Pay', 'Pay quickly with Apple Pay.', 'apple-pay', 3, false),
  ('zalopay', 'ZaloPay', 'Pay securely with your ZaloPay wallet.', 'zalopay', 4, false),
  ('bank-transfer', 'Bank transfer', 'Complete the transfer using Linery payment details.', 'bank', 5, true)
on conflict (code) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.site_menu_items (menu_id, label, href, item_type, sort_order)
select m.id, seed.label, seed.href, seed.item_type, seed.sort_order
from public.site_menus m
cross join (values
  ('Books', '/all-books', 'link', 1),
  ('Creators', '/creators', 'creator', 2),
  ('News', '/news', 'link', 3),
  ('About us', '/news/gioi-thieu', 'link', 4)
) as seed(label, href, item_type, sort_order)
where m.menu_key = 'header-main'
  and not exists (
    select 1 from public.site_menu_items i
    where i.menu_id = m.id and i.href = seed.href
  );

insert into public.site_menu_items (menu_id, label, href, item_type, sort_order)
select m.id, seed.label, seed.href, seed.item_type, seed.sort_order
from public.site_menus m
cross join (values
  ('About us', '/news/gioi-thieu', 'link', 1),
  ('Contact', '/news/lien-he', 'link', 2),
  ('Policies', '/news/chinh-sach', 'link', 3),
  ('Terms', '/news/dieu-khoan', 'link', 4)
) as seed(label, href, item_type, sort_order)
where m.menu_key = 'footer-main'
  and not exists (
    select 1 from public.site_menu_items i
    where i.menu_id = m.id and i.href = seed.href
  );

commit;
