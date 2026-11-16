begin;

-- Values read from linery-books-google.xlsx (the source workbook used for the catalog).
-- Keep the source spelling in the slug so future imports can resolve the same values.
insert into public.taxonomy_terms (kind, name, slug, sort_order)
values
  ('format', 'Novel', 'novel', 5),
  ('format', 'Stories', 'stories', 6),
  ('line', 'Fiction', 'fiction', 4)
on conflict (kind, slug) do update
set name = excluded.name,
    is_active = true;

commit;
