create table if not exists public.site_media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  alt_text text,
  asset_type text not null default 'banner',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_banners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position_code text not null,
  media_asset_id uuid references public.site_media_assets(id) on delete set null,
  sort_order integer not null default 1,
  display_mode text not null default 'desktop-mobile',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_banners_position_order_idx
  on public.site_banners(position_code, sort_order);

alter table public.site_media_assets enable row level security;
alter table public.site_banners enable row level security;

drop policy if exists "public can read active media assets" on public.site_media_assets;
create policy "public can read active media assets"
  on public.site_media_assets for select
  using (is_active = true);

drop policy if exists "public can read published banners" on public.site_banners;
create policy "public can read published banners"
  on public.site_banners for select
  using (status = 'published');

drop policy if exists "demo can insert media metadata" on public.site_media_assets;
create policy "demo can insert media metadata"
  on public.site_media_assets for insert
  to anon, authenticated
  with check (true);

drop policy if exists "demo can insert banners" on public.site_banners;
create policy "demo can insert banners"
  on public.site_banners for insert
  to anon, authenticated
  with check (true);

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can read site media" on storage.objects;
create policy "public can read site media"
  on storage.objects for select
  using (bucket_id = 'site-media');

drop policy if exists "demo can upload site media" on storage.objects;
create policy "demo can upload site media"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'site-media');
