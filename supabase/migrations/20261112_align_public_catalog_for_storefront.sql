begin;

create index if not exists books_public_catalog_idx
  on public.books (publication_date desc nulls last, created_at desc)
  where status = 'active' and is_visible_website = true;

create index if not exists book_homepage_modules_module_sort_idx
  on public.book_homepage_modules (module_id, sort_order, book_id);

insert into public.book_images (book_id, storage_path, alt_text, sort_order, is_primary)
select b.id, b.cover_storage_path, b.title, 0, true
from public.books b
where b.status = 'active'
  and b.is_visible_website = true
  and b.cover_storage_path is not null
  and not exists (select 1 from public.book_images bi where bi.book_id = b.id)
on conflict do nothing;

insert into public.homepage_modules (name, slug, sort_order, is_active) values
  ('New & Upcoming', 'new-upcoming', 1, true),
  ('Linery Press', 'linery-press', 2, true),
  ('Linery Picks', 'linery-picks', 3, true),
  ('Grab & Save', 'grab-save', 4, true)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, is_active = excluded.is_active;

with ranked as (
  select b.id, m.id as module_id,
    row_number() over (partition by m.id order by b.publication_date desc nulls last, b.created_at desc, b.id) as position
  from public.books b cross join public.homepage_modules m
  where b.status = 'active' and b.is_visible_website = true and m.slug = 'new-upcoming'
)
insert into public.book_homepage_modules (book_id, module_id, sort_order)
select id, module_id, position::int from ranked where position <= 6
on conflict do nothing;

with ranked as (
  select b.id, m.id as module_id,
    row_number() over (partition by m.id order by b.created_at desc, b.id) as position
  from public.books b cross join public.homepage_modules m
  where b.status = 'active' and b.is_visible_website = true and m.slug in ('linery-press', 'linery-picks')
)
insert into public.book_homepage_modules (book_id, module_id, sort_order)
select id, module_id, position::int from ranked where position <= 6
on conflict do nothing;

with ranked as (
  select b.id, m.id as module_id,
    row_number() over (partition by m.id order by b.sale_price_vnd asc, b.created_at desc, b.id) as position
  from public.books b cross join public.homepage_modules m
  where b.status = 'active' and b.is_visible_website = true
    and b.inventory_quantity > b.reserved_inventory_quantity and m.slug = 'grab-save'
)
insert into public.book_homepage_modules (book_id, module_id, sort_order)
select id, module_id, position::int from ranked where position <= 6
on conflict do nothing;

commit;
