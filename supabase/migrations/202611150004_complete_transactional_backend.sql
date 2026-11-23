begin;

-- Operational data is kept separate from the catalog so every stock and
-- order change has an auditable record (bản ghi có thể kiểm tra lại).
create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  transaction_type text not null check (transaction_type in ('receipt', 'reservation', 'release', 'sale', 'adjustment')),
  quantity_delta integer not null check (quantity_delta <> 0),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_transactions_book_created_idx
  on public.inventory_transactions(book_id, created_at desc);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_created_idx
  on public.order_status_history(order_id, created_at desc);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12,0) not null check (discount_value > 0),
  minimum_order_value numeric(12,0) not null default 0 check (minimum_order_value >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 100),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

alter table public.orders add column if not exists promotion_id uuid references public.promotions(id) on delete set null;

alter table public.inventory_transactions enable row level security;
alter table public.order_status_history enable row level security;
alter table public.promotions enable row level security;

drop policy if exists "users read own order status history" on public.order_status_history;
create policy "users read own order status history"
  on public.order_status_history for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "public reads active promotions" on public.promotions;
create policy "public reads active promotions"
  on public.promotions for select
  using (is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders for select using (public.is_admin());
drop policy if exists "admins read order items" on public.order_items;
create policy "admins read order items" on public.order_items for select using (public.is_admin());
drop policy if exists "admins read order payments" on public.order_payments;
create policy "admins read order payments" on public.order_payments for select using (public.is_admin());
drop policy if exists "admins read customer profiles" on public.customer_profiles;
create policy "admins read customer profiles" on public.customer_profiles for select using (public.is_admin());
drop policy if exists "admins read books" on public.books;
create policy "admins read books" on public.books for select using (public.is_admin());
drop policy if exists "admins manage creator roles" on public.creator_roles;
create policy "admins manage creator roles" on public.creator_roles for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage taxonomy terms" on public.taxonomy_terms;
create policy "admins manage taxonomy terms" on public.taxonomy_terms for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage homepage modules" on public.homepage_modules;
create policy "admins manage homepage modules" on public.homepage_modules for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage book homepage modules" on public.book_homepage_modules;
create policy "admins manage book homepage modules" on public.book_homepage_modules for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins read reviews" on public.book_reviews;
create policy "admins read reviews" on public.book_reviews for select using (public.is_admin());
drop policy if exists "admins manage inventory transactions" on public.inventory_transactions;
create policy "admins manage inventory transactions" on public.inventory_transactions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage order status history" on public.order_status_history;
create policy "admins manage order status history" on public.order_status_history for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage promotions" on public.promotions;
create policy "admins manage promotions" on public.promotions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage payment methods" on public.payment_methods;
create policy "admins manage payment methods" on public.payment_methods for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage site media assets" on public.site_media_assets;
create policy "admins manage site media assets" on public.site_media_assets for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.admin_list_customers()
returns table(user_id uuid, email text, display_name text, phone text, order_count bigint, created_at timestamptz)
language sql
security definer
set search_path = public, auth
as $$
  select u.id,
    u.email,
    coalesce(cp.display_name, split_part(coalesce(u.email, 'Khách hàng'), '@', 1)),
    cp.phone,
    count(o.id)::bigint,
    coalesce(cp.created_at, u.created_at)
  from auth.users u
  left join public.customer_profiles cp on cp.id = u.id
  left join public.orders o on o.user_id = u.id
  where public.is_admin()
  group by u.id, u.email, cp.display_name, cp.phone, cp.created_at, u.created_at
  order by coalesce(cp.created_at, u.created_at) desc;
$$;

revoke all on function public.admin_list_customers() from public;
grant execute on function public.admin_list_customers() to authenticated;

create or replace function public.admin_set_review_status(p_review_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if p_status not in ('approved', 'rejected', 'pending') then raise exception 'INVALID_REVIEW_STATUS'; end if;
  update public.book_reviews set status = p_status, updated_at = now() where id = p_review_id;
  if not found then raise exception 'REVIEW_NOT_FOUND'; end if;
end;
$$;

revoke all on function public.admin_set_review_status(uuid, text) from public;
grant execute on function public.admin_set_review_status(uuid, text) to authenticated;

-- Remove the legacy five-argument overload so RPC cannot silently execute the
-- old order flow without promotion and inventory-audit handling.
drop function if exists public.create_order_from_cart(text, text, jsonb, text, text);

create or replace function public.create_order_from_cart(
  p_fulfillment_method text,
  p_payment_method text,
  p_shipping_address jsonb default '{}'::jsonb,
  p_delivery_notes text default '',
  p_guest_email text default null,
  p_promotion_code text default null
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
  v_discount numeric(12,0) := 0;
  v_delivery_fee numeric(12,0) := 0;
  v_promotion public.promotions;
  v_line record;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_fulfillment_method not in ('pickup', 'delivery') then raise exception 'INVALID_FULFILLMENT_METHOD'; end if;

  if p_fulfillment_method = 'delivery' then
    select coalesce(dz.fee_vnd, 0) into v_delivery_fee
    from public.delivery_zones dz
    where dz.is_active = true
      and lower(trim(dz.name)) = lower(trim(coalesce(p_shipping_address ->> 'city', '')))
    order by dz.sort_order asc
    limit 1;
  end if;

  select id into v_cart_id from public.carts where user_id = v_user_id for update;
  if v_cart_id is null or not exists (select 1 from public.cart_items where cart_id = v_cart_id) then raise exception 'CART_EMPTY'; end if;

  if nullif(trim(p_promotion_code), '') is not null then
    select * into v_promotion
    from public.promotions
    where upper(code) = upper(trim(p_promotion_code))
      and is_active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
      and (usage_limit is null or usage_count < usage_limit)
    for update;
    if not found then raise exception 'PROMOTION_INVALID'; end if;
  end if;

  v_order_number := 'LINERY-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');
  insert into public.orders (order_number, user_id, guest_email, status, payment_status, fulfillment_method, payment_method, shipping_address, delivery_notes, promotion_id)
  values (v_order_number, v_user_id, nullif(trim(p_guest_email), ''), 'pending', 'pending', p_fulfillment_method, nullif(trim(p_payment_method), ''), coalesce(p_shipping_address, '{}'::jsonb), nullif(trim(p_delivery_notes), ''), v_promotion.id)
  returning id into v_order_id;

  for v_line in
    select ci.book_id, ci.quantity, b.isbn, b.title, b.sale_price_vnd,
      greatest(coalesce(b.inventory_quantity, 0) - coalesce(b.reserved_inventory_quantity, 0), 0) as available_quantity
    from public.cart_items ci join public.books b on b.id = ci.book_id
    where ci.cart_id = v_cart_id for update of b
  loop
    if v_line.available_quantity < v_line.quantity then raise exception 'INSUFFICIENT_STOCK:%', v_line.title; end if;
    v_subtotal := v_subtotal + (coalesce(v_line.sale_price_vnd, 0) * v_line.quantity);
    insert into public.order_items (order_id, book_id, isbn, title_snapshot, unit_price_vnd, quantity, line_total_vnd)
    values (v_order_id, v_line.book_id, v_line.isbn, v_line.title, coalesce(v_line.sale_price_vnd, 0), v_line.quantity, coalesce(v_line.sale_price_vnd, 0) * v_line.quantity);
    update public.books set reserved_inventory_quantity = coalesce(reserved_inventory_quantity, 0) + v_line.quantity, updated_at = now() where id = v_line.book_id;
    insert into public.inventory_transactions (book_id, order_id, transaction_type, quantity_delta, note, created_by)
    values (v_line.book_id, v_order_id, 'reservation', v_line.quantity, 'Giữ hàng khi tạo đơn', v_user_id);
  end loop;

  if v_promotion.id is not null then
    if v_subtotal < v_promotion.minimum_order_value then raise exception 'PROMOTION_MINIMUM_NOT_MET'; end if;
    v_discount := case when v_promotion.discount_type = 'percent' then round(v_subtotal * v_promotion.discount_value / 100) else least(v_subtotal, v_promotion.discount_value) end;
    update public.promotions set usage_count = usage_count + 1, updated_at = now() where id = v_promotion.id;
  end if;

  update public.orders set subtotal_vnd = v_subtotal, discount_vnd = v_discount, delivery_fee_vnd = v_delivery_fee, total_vnd = greatest(v_subtotal - v_discount, 0) + v_delivery_fee, updated_at = now() where id = v_order_id;
  insert into public.order_payments (order_id, provider, amount_vnd, status) select v_order_id, coalesce(nullif(trim(p_payment_method), ''), 'manual'), greatest(v_subtotal - v_discount, 0) + v_delivery_fee, 'pending';
  insert into public.order_status_history (order_id, to_status, note, changed_by) values (v_order_id, 'pending', 'Tạo đơn từ giỏ hàng', v_user_id);
  delete from public.cart_items where cart_id = v_cart_id;
  return query select v_order_id, v_order_number;
end;
$$;

revoke all on function public.create_order_from_cart(text, text, jsonb, text, text, text) from public;
grant execute on function public.create_order_from_cart(text, text, jsonb, text, text, text) to authenticated;

create or replace function public.admin_set_order_status(p_order_id uuid, p_status text, p_payment_status text default null, p_note text default null)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_previous_status text;
  v_item record;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if p_status not in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') then raise exception 'INVALID_ORDER_STATUS'; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  v_previous_status := v_order.status;
  if v_previous_status in ('cancelled', 'refunded') and p_status <> v_previous_status then
    raise exception 'CLOSED_ORDER_CANNOT_REOPEN';
  end if;

  if p_status in ('cancelled', 'refunded') and v_order.status not in ('cancelled', 'refunded', 'delivered') then
    for v_item in select oi.book_id, oi.quantity from public.order_items oi where oi.order_id = p_order_id and oi.book_id is not null for update
    loop
      update public.books set reserved_inventory_quantity = greatest(coalesce(reserved_inventory_quantity, 0) - v_item.quantity, 0), updated_at = now() where id = v_item.book_id;
      insert into public.inventory_transactions (book_id, order_id, transaction_type, quantity_delta, note, created_by) values (v_item.book_id, p_order_id, 'release', -v_item.quantity, 'Trả hàng giữ khi hủy đơn', auth.uid());
    end loop;
  elsif p_status = 'delivered' and v_order.status <> 'delivered' then
    for v_item in select oi.book_id, oi.quantity from public.order_items oi where oi.order_id = p_order_id and oi.book_id is not null for update
    loop
      update public.books set inventory_quantity = greatest(coalesce(inventory_quantity, 0) - v_item.quantity, 0), reserved_inventory_quantity = greatest(coalesce(reserved_inventory_quantity, 0) - v_item.quantity, 0), updated_at = now() where id = v_item.book_id;
      insert into public.inventory_transactions (book_id, order_id, transaction_type, quantity_delta, note, created_by) values (v_item.book_id, p_order_id, 'sale', -v_item.quantity, 'Ghi nhận bán khi giao thành công', auth.uid());
    end loop;
  end if;

  update public.orders set status = p_status, payment_status = coalesce(nullif(p_payment_status, ''), payment_status), updated_at = now() where id = p_order_id returning * into v_order;
  insert into public.order_status_history (order_id, from_status, to_status, note, changed_by) values (p_order_id, v_previous_status, p_status, nullif(trim(p_note), ''), auth.uid());
  return v_order;
end;
$$;

revoke all on function public.admin_set_order_status(uuid, text, text, text) from public;
grant execute on function public.admin_set_order_status(uuid, text, text, text) to authenticated;

commit;
