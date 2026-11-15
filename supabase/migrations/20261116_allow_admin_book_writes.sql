-- Admin book creation needs write access to the book row and its normalized
-- relations. Keep every write behind the existing is_admin() check.
do $$
declare
  target text;
begin
  foreach target in array array['books','book_images','book_creators','book_taxonomy_terms','book_homepage_modules'] loop
    execute format('drop policy if exists "admins manage %s" on public.%I', target, target);
    execute format('create policy "admins manage %s" on public.%I for all using (public.is_admin()) with check (public.is_admin())', target, target);
  end loop;
end $$;
