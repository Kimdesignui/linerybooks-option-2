-- Add locally hosted portraits that were already present in the repository.
begin;

with mapping(slug, storage_path) as (
  values
    ('charles-baudelaire', '/assets/creators/charles-baudelaire.jpg'),
    ('e-t-a-hoffmann', '/assets/creators/e-t-a-hoffmann.jpg'),
    ('jack-london', '/assets/creators/jack-london.jpg'),
    ('fernando-pessoa', '/assets/creators/fernando-pessoa.png'),
    ('ken-kesey', '/assets/creators/ken-kesey.jpg'),
    ('mark-twain', '/assets/creators/mark-twain.jpg'),
    ('robin-wall-kimmerer', '/assets/creators/robin-wall-kimmerer.jpg'),
    ('thomas-bernhard', '/assets/creators/thomas-bernhard.jpg'),
    ('thomas-e-ricks', '/assets/creators/thomas-e-ricks.jpg')
), matched as (
  select c.id, c.display_name, m.storage_path
  from public.creators c
  join mapping m on m.slug = c.slug
)
delete from public.creator_images ci
using matched
where ci.creator_id = matched.id;

with mapping(slug, storage_path) as (
  values
    ('charles-baudelaire', '/assets/creators/charles-baudelaire.jpg'),
    ('e-t-a-hoffmann', '/assets/creators/e-t-a-hoffmann.jpg'),
    ('jack-london', '/assets/creators/jack-london.jpg'),
    ('fernando-pessoa', '/assets/creators/fernando-pessoa.png'),
    ('ken-kesey', '/assets/creators/ken-kesey.jpg'),
    ('mark-twain', '/assets/creators/mark-twain.jpg'),
    ('robin-wall-kimmerer', '/assets/creators/robin-wall-kimmerer.jpg'),
    ('thomas-bernhard', '/assets/creators/thomas-bernhard.jpg'),
    ('thomas-e-ricks', '/assets/creators/thomas-e-ricks.jpg')
)
insert into public.creator_images (creator_id, storage_path, alt_text, sort_order, is_primary)
select c.id, m.storage_path, c.display_name, 0, true
from public.creators c
join mapping m on m.slug = c.slug;

commit;
