begin;

-- In-app admin notifications. OneSignal can use the same event data later as
-- the push-notification delivery channel; it is not the source of truth.
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  event_type text not null default 'system',
  action_href text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_recipient_created_idx
  on public.admin_notifications (recipient_user_id, created_at desc);

alter table public.admin_notifications enable row level security;

drop policy if exists "admins read own notifications" on public.admin_notifications;
create policy "admins read own notifications"
  on public.admin_notifications
  for select
  using (public.is_admin() and recipient_user_id = auth.uid());

drop policy if exists "admins update own notifications" on public.admin_notifications;
create policy "admins update own notifications"
  on public.admin_notifications
  for update
  using (public.is_admin() and recipient_user_id = auth.uid())
  with check (public.is_admin() and recipient_user_id = auth.uid());

revoke all on table public.admin_notifications from anon, authenticated;
grant select, update on table public.admin_notifications to authenticated;

create or replace function public.notify_admin_order_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (recipient_user_id, title, message, event_type, action_href, payload)
  select au.user_id,
    'Đơn hàng mới',
    format('Đơn hàng %s vừa được tạo với tổng tiền %s.', new.order_number, to_char(new.total_vnd, 'FM999G999G999G999')),
    'order',
    '/admin/orders',
    jsonb_build_object('order_id', new.id, 'order_number', new.order_number, 'total_vnd', new.total_vnd)
  from public.admin_users au;
  return new;
end;
$$;

create or replace function public.notify_admin_review_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (recipient_user_id, title, message, event_type, action_href, payload)
  select au.user_id,
    'Đánh giá mới cần duyệt',
    format('Có đánh giá %s sao mới đang chờ kiểm duyệt.', new.rating),
    'content',
    '/admin/reviews',
    jsonb_build_object('review_id', new.id, 'book_id', new.book_id, 'rating', new.rating)
  from public.admin_users au;
  return new;
end;
$$;

drop trigger if exists admin_notification_after_order_insert on public.orders;
create trigger admin_notification_after_order_insert
  after insert on public.orders
  for each row execute function public.notify_admin_order_created();

drop trigger if exists admin_notification_after_review_insert on public.book_reviews;
create trigger admin_notification_after_review_insert
  after insert on public.book_reviews
  for each row execute function public.notify_admin_review_created();

revoke all on function public.notify_admin_order_created() from public;
revoke all on function public.notify_admin_review_created() from public;

commit;
