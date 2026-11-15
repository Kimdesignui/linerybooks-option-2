begin;

-- The browser never decides the price or inventory. It only submits a cart and
-- the database creates an order from the current catalog rows.
create or replace function public.create_order_from_cart(
  p_fulfillment_method text,
  p_payment_method text,
  p_shipping_address jsonb default '{}'::jsonb,
  p_delivery_notes text default '',
  p_guest_email text default null
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,0) := 0;
  v_line record;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_fulfillment_method not in ('pickup', 'delivery') then
    raise exception 'INVALID_FULFILLMENT_METHOD';
  end if;

  select id into v_cart_id from public.carts where user_id = v_user_id for update;
  if v_cart_id is null then raise exception 'CART_EMPTY'; end if;

  if not exists (select 1 from public.cart_items where cart_id = v_cart_id) then
    raise exception 'CART_EMPTY';
  end if;

  v_order_number := 'LINERY-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');
  insert into public.orders (order_number, user_id, guest_email, status, payment_status, fulfillment_method, payment_method, shipping_address, delivery_notes)
  values (v_order_number, v_user_id, nullif(trim(p_guest_email), ''), 'pending', 'pending', p_fulfillment_method, nullif(trim(p_payment_method), ''), coalesce(p_shipping_address, '{}'::jsonb), nullif(trim(p_delivery_notes), ''))
  returning id into v_order_id;

  for v_line in
    select ci.book_id, ci.quantity, b.isbn, b.title, b.sale_price_vnd,
           greatest(coalesce(b.inventory_quantity, 0) - coalesce(b.reserved_inventory_quantity, 0), 0) as available_quantity
    from public.cart_items ci
    join public.books b on b.id = ci.book_id
    where ci.cart_id = v_cart_id
    for update of b
  loop
    if v_line.available_quantity < v_line.quantity then
      raise exception 'INSUFFICIENT_STOCK:%', v_line.title;
    end if;
    v_subtotal := v_subtotal + (coalesce(v_line.sale_price_vnd, 0) * v_line.quantity);
    insert into public.order_items (order_id, book_id, isbn, title_snapshot, unit_price_vnd, quantity, line_total_vnd)
    values (v_order_id, v_line.book_id, v_line.isbn, v_line.title, coalesce(v_line.sale_price_vnd, 0), v_line.quantity, coalesce(v_line.sale_price_vnd, 0) * v_line.quantity);
    update public.books set reserved_inventory_quantity = coalesce(reserved_inventory_quantity, 0) + v_line.quantity, updated_at = now() where id = v_line.book_id;
  end loop;

  update public.orders set subtotal_vnd = v_subtotal, total_vnd = v_subtotal, updated_at = now() where id = v_order_id;
  insert into public.order_payments (order_id, provider, amount_vnd, status) values (v_order_id, coalesce(nullif(trim(p_payment_method), ''), 'manual'), v_subtotal, 'pending');
  delete from public.cart_items where cart_id = v_cart_id;
  return query select v_order_id, v_order_number;
end;
$$;

revoke all on function public.create_order_from_cart(text, text, jsonb, text, text) from public;
grant execute on function public.create_order_from_cart(text, text, jsonb, text, text) to authenticated;

-- Admin access is explicit. Do not expose write policies to every logged-in
-- customer; seed the operator's auth.users id into this table during setup.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_customer_profile()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.customer_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_linery on auth.users;
create trigger on_auth_user_created_linery
  after insert on auth.users
  for each row execute procedure public.handle_new_customer_profile();

-- Remove the temporary demo write paths from the media migration. Public users
-- may read published assets, but only an authenticated admin may mutate the
-- asset metadata, banners, or the site-media storage bucket.
drop policy if exists "demo can insert media metadata" on public.site_media_assets;
drop policy if exists "demo can insert banners" on public.site_banners;
drop policy if exists "demo can upload site media" on storage.objects;
drop policy if exists "admins manage site media storage" on storage.objects;
create policy "admins manage site media storage"
  on storage.objects for all
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

do $$
declare
  target text;
begin
  foreach target in array array['site_menus','site_menu_items','news_posts','news_post_blocks','site_media_assets','site_banners','creators','creator_images'] loop
    execute format('drop policy if exists "admins manage %s" on public.%I', target, target);
    execute format('create policy "admins manage %s" on public.%I for all using (public.is_admin()) with check (public.is_admin())', target, target);
  end loop;
end $$;

-- The transaction function is the only write path needed by the storefront;
-- users can still maintain their own cart and wishlist rows directly.
drop policy if exists "users create own orders" on public.orders;
drop policy if exists "users create own order items" on public.order_items;
drop policy if exists "users create own payments" on public.order_payments;

commit;
