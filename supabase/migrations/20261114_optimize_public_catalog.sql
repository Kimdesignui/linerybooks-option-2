begin;

-- Keep the public catalog's filtered/order-by query index-only friendly.
create index if not exists books_public_catalog_created_idx
  on public.books (created_at desc, id)
  where status = 'active' and is_visible_website = true;

-- The storefront now scopes related rows to the visible book ids.
create index if not exists book_images_book_sort_idx
  on public.book_images (book_id, is_primary desc, sort_order);

create index if not exists book_creators_book_sort_idx
  on public.book_creators (book_id, role, sort_order);

create index if not exists book_taxonomy_terms_book_term_idx
  on public.book_taxonomy_terms (book_id, term_id);

create index if not exists book_homepage_modules_book_sort_idx
  on public.book_homepage_modules (book_id, sort_order, module_id);

commit;
