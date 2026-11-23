-- Keep the site-media bucket publicly downloadable while preventing clients
-- from listing every object in the bucket through storage.objects.
-- Public URLs continue to work because the bucket itself remains public.
drop policy if exists "public can read site media" on storage.objects;

-- Some hosted environments used the later policy names below. Remove those
-- aliases too, including the temporary anonymous upload path.
drop policy if exists "public reads site media files" on storage.objects;
drop policy if exists "demo uploads site media files" on storage.objects;

