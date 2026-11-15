begin;

-- The catalog covers are uploaded to the public site-media bucket before this
-- migration is applied. This keeps the database as the source of truth for
-- each cover while allowing the storefront to build the public Storage URL.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = excluded.public;

update public.book_images bi
set storage_path = regexp_replace(bi.storage_path, '^.*/', '')
where bi.storage_path like '/media/assets/%'
  and exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'site-media'
      and o.name = regexp_replace(bi.storage_path, '^.*/', '')
  );

update public.books b
set cover_storage_path = regexp_replace(b.cover_storage_path, '^.*/', ''),
    updated_at = now()
where b.cover_storage_path like '/media/assets/%'
  and exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'site-media'
      and o.name = regexp_replace(b.cover_storage_path, '^.*/', '')
  );

commit;
