begin;

-- Book creation/update owns its cover and reading-sample uploads. Do not
-- require the unrelated media.manage permission for files attached to a book.
drop policy if exists "admins manage site media storage" on storage.objects;
create policy "admins manage site media storage"
  on storage.objects for all
  using (
    bucket_id = 'site-media'
    and (
      public.admin_has_permission('media.manage')
      or public.admin_has_permission('books.create')
      or public.admin_has_permission('books.update')
    )
  )
  with check (
    bucket_id = 'site-media'
    and (
      public.admin_has_permission('media.manage')
      or public.admin_has_permission('books.create')
      or public.admin_has_permission('books.update')
    )
  );

drop policy if exists "authenticated can upload book samples" on storage.objects;
create policy "authenticated can upload book samples"
  on storage.objects for all
  using (
    bucket_id = 'book-samples'
    and (
      public.admin_has_permission('books.create')
      or public.admin_has_permission('books.update')
    )
  )
  with check (
    bucket_id = 'book-samples'
    and (
      public.admin_has_permission('books.create')
      or public.admin_has_permission('books.update')
    )
  );

commit;
