begin;

-- Repair creator names imported with UTF-8 bytes decoded as Windows-1252,
-- then move their book links to the existing correctly encoded creator rows.
do $$
declare
  duplicate_pair record;
begin
  for duplicate_pair in
    select bad.id as bad_id, good.id as good_id
    from (values
      ('frana-ois-rena-de-chateaubriand', 'francois-rene-de-chateaubriand'),
      ('paul-vala-ry', 'paulvalery'),
      ('julio-rama-n-ribeyro', 'julio-ramon-ribeyro')
    ) as pair(bad_slug, good_slug)
    join public.creators bad on bad.slug = pair.bad_slug
    join public.creators good on good.slug = pair.good_slug
  loop
    insert into public.book_creators (book_id, creator_id, role, sort_order)
    select book_id, duplicate_pair.good_id, role, sort_order
    from public.book_creators
    where creator_id = duplicate_pair.bad_id
    on conflict (book_id, creator_id, role) do nothing;

    delete from public.book_creators
    where creator_id = duplicate_pair.bad_id;

    delete from public.creators
    where id = duplicate_pair.bad_id;
  end loop;
end $$;

-- These rows have no book links and are invalid import artefacts.
update public.creators
set is_active = false,
    updated_at = now()
where slug in ('ag', 'agb', 'gdagda', 'dgda')
  and not exists (
    select 1 from public.book_creators bc where bc.creator_id = creators.id
  );

commit;
