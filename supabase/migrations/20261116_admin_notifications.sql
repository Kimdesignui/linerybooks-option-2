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

commit;
