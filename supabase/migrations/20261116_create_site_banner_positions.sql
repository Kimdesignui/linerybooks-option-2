create table if not exists public.site_banner_positions (
  code text primary key check (code = upper(code) and code ~ '^[A-Z0-9_]+$'),
  name text not null,
  display_mode text not null default 'Desktop / mobile',
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('published', 'draft', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_banner_positions (code, name, sort_order)
select position_code, position_code, row_number() over (order by position_code) - 1
from (select distinct position_code from public.site_banners where position_code is not null and position_code <> '') positions
on conflict (code) do nothing;

alter table public.site_banner_positions enable row level security;

drop policy if exists "public can read published banner positions" on public.site_banner_positions;
create policy "public can read published banner positions"
  on public.site_banner_positions for select
  using (status = 'published');

drop policy if exists "admins manage banner positions" on public.site_banner_positions;
create policy "admins manage banner positions"
  on public.site_banner_positions for all
  using (public.is_admin())
  with check (public.is_admin());
