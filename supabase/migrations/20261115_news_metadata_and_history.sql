begin;

-- Metadata (dữ liệu mô tả) used by the real editorial workflow.
alter table public.news_posts
  add column if not exists seo_title_en text,
  add column if not exists seo_title_vi text,
  add column if not exists seo_description_en text,
  add column if not exists seo_description_vi text,
  add column if not exists seo_keywords text[] not null default '{}',
  add column if not exists category_slugs text[] not null default '{}',
  add column if not exists is_featured boolean not null default false,
  add column if not exists show_on_homepage boolean not null default false,
  add column if not exists display_format text not null default 'standard';

do $$
begin
  alter table public.news_posts
    add constraint news_posts_display_format_check
    check (display_format in ('standard', 'video'));
exception when duplicate_object then null;
end $$;

create table if not exists public.news_post_history (
  id uuid primary key default gen_random_uuid(),
  news_post_id uuid not null references public.news_posts(id) on delete cascade,
  action text not null check (action in ('created', 'updated', 'published', 'unpublished')),
  performed_by uuid references auth.users(id) on delete set null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists news_post_history_post_created_idx
  on public.news_post_history(news_post_id, created_at desc);

alter table public.news_post_history enable row level security;
drop policy if exists "admins manage news post history" on public.news_post_history;
create policy "admins manage news post history"
  on public.news_post_history for all
  using (public.is_admin())
  with check (public.is_admin());

commit;
