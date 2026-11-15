begin;

-- Operational records for the remaining admin modules.
create table if not exists public.store_locations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  location_type text not null default 'store',
  address text,
  city text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null default 'city',
  fee_vnd numeric(12,0) not null default 0 check (fee_vnd >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chatbot_quick_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  language text not null default 'en' check (language in ('en', 'vi')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_import_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  imported_by uuid references auth.users(id) on delete set null,
  total_rows integer not null default 0 check (total_rows >= 0),
  valid_rows integer not null default 0 check (valid_rows >= 0),
  error_rows integer not null default 0 check (error_rows >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_report_path text,
  created_at timestamptz not null default now()
);

alter table public.store_locations enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.chatbot_quick_prompts enable row level security;
alter table public.book_import_batches enable row level security;

drop policy if exists "public reads active delivery zones" on public.delivery_zones;
create policy "public reads active delivery zones" on public.delivery_zones for select using (is_active = true);
drop policy if exists "public reads active store locations" on public.store_locations;
create policy "public reads active store locations" on public.store_locations for select using (is_active = true);
drop policy if exists "public reads active chatbot prompts" on public.chatbot_quick_prompts;
create policy "public reads active chatbot prompts" on public.chatbot_quick_prompts for select using (is_active = true);

drop policy if exists "admins manage store locations" on public.store_locations;
create policy "admins manage store locations" on public.store_locations for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage delivery zones" on public.delivery_zones;
create policy "admins manage delivery zones" on public.delivery_zones for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage chatbot prompts" on public.chatbot_quick_prompts;
create policy "admins manage chatbot prompts" on public.chatbot_quick_prompts for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage import batches" on public.book_import_batches;
create policy "admins manage import batches" on public.book_import_batches for all using (public.is_admin()) with check (public.is_admin());

insert into public.store_locations (code, name, location_type, address, city, sort_order, is_active)
values ('WEB', 'Website Linery', 'online', 'Online', 'Hà Nội', 1, true)
on conflict (code) do nothing;

insert into public.delivery_zones (name, level, fee_vnd, sort_order, is_active)
values ('Hà Nội', 'city', 0, 1, true)
on conflict do nothing;

insert into public.chatbot_quick_prompts (prompt, language, sort_order, is_active)
values ('Find a book', 'en', 1, true), ('Tìm sách theo tác giả', 'vi', 2, true)
on conflict do nothing;

commit;
