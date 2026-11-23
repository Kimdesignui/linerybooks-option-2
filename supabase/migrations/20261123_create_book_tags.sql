begin;

-- Tags are intentionally independent from taxonomy_terms. A tag is a free-form
-- cross-cutting label such as "Nữ quyền", not a category/genre/format value.
create table if not exists public.book_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_tag_links (
  book_id uuid not null references public.books(id) on delete cascade,
  tag_id uuid not null references public.book_tags(id) on delete restrict,
  primary key (book_id, tag_id)
);

create index if not exists book_tag_links_tag_book_idx on public.book_tag_links (tag_id, book_id);
create index if not exists book_tag_links_book_tag_idx on public.book_tag_links (book_id, tag_id);

alter table public.book_tags enable row level security;
alter table public.book_tag_links enable row level security;

drop policy if exists "public reads active book tags" on public.book_tags;
create policy "public reads active book tags" on public.book_tags for select using (is_active = true);
drop policy if exists "admins manage book tags" on public.book_tags;
create policy "admins manage book tags" on public.book_tags for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads book tag links" on public.book_tag_links;
create policy "public reads book tag links" on public.book_tag_links for select using (true);
drop policy if exists "admins manage book tag links" on public.book_tag_links;
create policy "admins manage book tag links" on public.book_tag_links for all using (public.is_admin()) with check (public.is_admin());

commit;
