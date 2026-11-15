-- Remove the final third-party creator image URLs. Creators without a local
-- portrait use the host-served avatar placeholder until an editor uploads one.
begin;

with mapping(slug, storage_path) as (
  values
    ('jonathan-swift', '/assets/creators/jonathan-swift.jpg'),
    ('gunbrittsundstrom', '/assets/author-avatar-placeholder.png'),
    ('yoko-ogawa', '/assets/author-avatar-placeholder.png'),
    ('sebastian-faulks', '/assets/author-avatar-placeholder.png'),
    ('isabel-allende', '/assets/author-avatar-placeholder.png'),
    ('cesare-pavese', '/assets/creators/cesare-pavese.jpg'),
    ('ivan-turgenev', '/assets/creators/ivan-turgenev.jpg'),
    ('simone-weil', '/assets/author-avatar-placeholder.png')
), matched as (
  select c.id
  from public.creators c
  join mapping m on m.slug = c.slug
)
delete from public.creator_images ci
using matched
where ci.creator_id = matched.id;

with mapping(slug, storage_path) as (
  values
    ('jonathan-swift', '/assets/creators/jonathan-swift.jpg'),
    ('gunbrittsundstrom', '/assets/author-avatar-placeholder.png'),
    ('yoko-ogawa', '/assets/author-avatar-placeholder.png'),
    ('sebastian-faulks', '/assets/author-avatar-placeholder.png'),
    ('isabel-allende', '/assets/author-avatar-placeholder.png'),
    ('cesare-pavese', '/assets/creators/cesare-pavese.jpg'),
    ('ivan-turgenev', '/assets/creators/ivan-turgenev.jpg'),
    ('simone-weil', '/assets/author-avatar-placeholder.png')
)
insert into public.creator_images (creator_id, storage_path, alt_text, sort_order, is_primary)
select c.id, m.storage_path, c.display_name, 0, true
from public.creators c
join mapping m on m.slug = c.slug;

commit;
