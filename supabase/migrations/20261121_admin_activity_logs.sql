-- Central audit trail for authenticated administrator actions.
create table if not exists public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  resource_type text not null,
  resource_id text,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_idx
  on public.admin_activity_logs(created_at desc);
create index if not exists admin_activity_logs_resource_idx
  on public.admin_activity_logs(resource_type, resource_id, created_at desc);

alter table public.admin_activity_logs enable row level security;
drop policy if exists "admins read activity logs" on public.admin_activity_logs;
create policy "admins read activity logs"
  on public.admin_activity_logs for select
  using (public.is_admin());

grant select on public.admin_activity_logs to authenticated;

create or replace function public.record_admin_activity()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  snapshot jsonb;
  resource_id text;
begin
  if auth.uid() is null or not coalesce(public.is_admin(), false) then
    return coalesce(new, old);
  end if;

  snapshot := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  snapshot := snapshot - array['password', 'encrypted_password', 'secret', 'api_key', 'token', 'access_token', 'refresh_token'];
  resource_id := coalesce(snapshot ->> 'id', snapshot ->> 'user_id', snapshot ->> 'slug');

  insert into public.admin_activity_logs (actor_id, actor_email, action, resource_type, resource_id, summary)
  values (
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    lower(tg_op),
    tg_table_name,
    resource_id,
    jsonb_build_object('table', tg_table_name, 'operation', lower(tg_op), 'snapshot', snapshot)
  );

  return coalesce(new, old);
end;
$$;

revoke all on function public.record_admin_activity() from public;

do $$
declare
  target text;
begin
  foreach target in array array[
    'books', 'book_authors', 'book_categories', 'book_topics', 'book_genres',
    'creators', 'creator_images', 'taxonomy_terms', 'news_posts',
    'site_media_assets', 'site_banners', 'site_settings', 'site_menus',
    'site_menu_items', 'homepage_modules', 'homepage_module_books',
    'book_import_batches', 'inventory_transactions', 'store_locations',
    'delivery_zones', 'payment_methods', 'promotions', 'book_reviews',
    'chatbot_quick_prompts', 'admin_users', 'admin_role_permissions'
  ] loop
    if to_regclass('public.' || target) is not null then
      execute format('drop trigger if exists audit_%I on public.%I', target, target);
      execute format(
        'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.record_admin_activity()',
        target, target
      );
    end if;
  end loop;
end $$;
