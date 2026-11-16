begin;

-- Enforce the same permission matrix in Postgres that the admin UI uses.
-- Public read policies remain intact; these policies govern authenticated admin access.
do $$
declare
  entry text;
  target text;
  permission_key text;
begin
  foreach entry in array array[
    'books:books.view',
    'book_images:books.view',
    'book_creators:books.view',
    'book_taxonomy_terms:books.view',
    'book_homepage_modules:books.view',
    'creators:authors.manage',
    'creator_roles:authors.manage',
    'creator_images:authors.manage',
    'taxonomy_terms:taxonomy.manage',
    'homepage_modules:homepage.manage',
    'news_posts:news.manage',
    'news_post_blocks:news.manage',
    'news_post_history:news.manage',
    'site_menus:website.manage',
    'site_menu_items:website.manage',
    'site_settings:website.manage',
    'site_media_assets:media.manage',
    'site_banners:media.manage',
    'orders:orders.manage',
    'order_items:orders.manage',
    'order_payments:orders.manage',
    'order_status_history:orders.manage',
    'customer_profiles:customers.view',
    'store_locations:locations.manage',
    'delivery_zones:locations.manage',
    'chatbot_quick_prompts:chatbot.manage',
    'book_import_batches:imports.manage',
    'inventory_transactions:inventory.manage',
    'promotions:promotions.manage',
    'payment_methods:payments.manage',
    'book_reviews:reviews.moderate'
  ] loop
    target := split_part(entry, ':', 1);
    permission_key := split_part(entry, ':', 2);

    execute format('drop policy if exists %I on public.%I', 'admins manage ' || target, target);
    execute format('drop policy if exists %I on public.%I', 'admins read ' || target, target);
    execute format('drop policy if exists %I on public.%I', 'admin select ' || target, target);
    execute format('drop policy if exists %I on public.%I', 'admin insert ' || target, target);
    execute format('drop policy if exists %I on public.%I', 'admin update ' || target, target);
    execute format('drop policy if exists %I on public.%I', 'admin delete ' || target, target);

    execute format(
      'create policy %I on public.%I for select using (public.admin_has_permission(%L))',
      'admin select ' || target, target, permission_key
    );
    execute format(
      'create policy %I on public.%I for insert with check (public.admin_has_permission(%L))',
      'admin insert ' || target, target, permission_key
    );
    execute format(
      'create policy %I on public.%I for update using (public.admin_has_permission(%L)) with check (public.admin_has_permission(%L))',
      'admin update ' || target, target, permission_key, permission_key
    );
    execute format(
      'create policy %I on public.%I for delete using (public.admin_has_permission(%L))',
      'admin delete ' || target, target, permission_key
    );
  end loop;

  -- Book creation and editing needs permission-specific writes on normalized links.
  foreach target in array array['books','book_images','book_creators','book_taxonomy_terms','book_homepage_modules'] loop
    execute format('drop policy if exists %I on public.%I', 'admin insert ' || target, target);
    execute format('drop policy if exists %I on public.%I', 'admin update ' || target, target);
    execute format('drop policy if exists %I on public.%I', 'admin delete ' || target, target);
    execute format('create policy %I on public.%I for insert with check (public.admin_has_permission(''books.create'') or public.admin_has_permission(''books.update''))', 'admin insert ' || target, target);
    execute format('create policy %I on public.%I for update using (public.admin_has_permission(''books.update'')) with check (public.admin_has_permission(''books.update''))', 'admin update ' || target, target);
    execute format('create policy %I on public.%I for delete using (public.admin_has_permission(''books.delete'') or public.admin_has_permission(''books.update''))', 'admin delete ' || target, target);
  end loop;
end $$;

-- The storage bucket follows the media permission rather than the old is_admin() gate.
drop policy if exists "admins manage site media storage" on storage.objects;
create policy "admins manage site media storage"
  on storage.objects for all
  using (bucket_id = 'site-media' and public.admin_has_permission('media.manage'))
  with check (bucket_id = 'site-media' and public.admin_has_permission('media.manage'));

drop policy if exists "authenticated can upload book samples" on storage.objects;
create policy "authenticated can upload book samples"
  on storage.objects for all
  using (bucket_id = 'book-samples' and public.admin_has_permission('books.create'))
  with check (bucket_id = 'book-samples' and public.admin_has_permission('books.create'));

commit;
