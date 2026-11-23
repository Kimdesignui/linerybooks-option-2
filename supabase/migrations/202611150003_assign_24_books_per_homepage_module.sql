begin;

-- Keep homepage modules data-driven: every active module gets at least 24
-- distinct visible books, ordered by the module's merchandising rule. Move
-- existing positions out of the target range first so the per-module unique
-- sort-order constraint cannot reject the reseed.

update public.book_homepage_modules l
set sort_order = l.sort_order + 1000000
from public.homepage_modules m
where m.id = l.module_id
  and m.is_active = true;

with ranked as (
  select
    b.id as book_id,
    m.id as module_id,
    row_number() over (
      partition by m.id
      order by
        case when m.slug = 'grab-save'
          then case when b.inventory_quantity > b.reserved_inventory_quantity then 0 else 1 end
          else 0
        end,
        case when m.slug = 'new-upcoming' then b.publication_date end desc nulls last,
        case when m.slug = 'grab-save' then b.sale_price_vnd end asc nulls last,
        b.created_at desc,
        b.id
    ) as position
  from public.books b
  cross join public.homepage_modules m
  where b.status = 'active'
    and b.is_visible_website = true
)
insert into public.book_homepage_modules (book_id, module_id, sort_order)
select book_id, module_id, position::int
from ranked
where position <= 24
on conflict (book_id, module_id) do nothing;

-- Remove links beyond the requested window so every active module renders
-- exactly 24 unique books when the catalog contains at least 24 visible books.
with ranked_links as (
  select
    l.book_id,
    l.module_id,
    row_number() over (
      partition by l.module_id
      order by l.sort_order, l.book_id
    ) as position
  from public.book_homepage_modules l
  join public.homepage_modules m on m.id = l.module_id
  where m.is_active = true
)
delete from public.book_homepage_modules l
using ranked_links r
where l.book_id = r.book_id
  and l.module_id = r.module_id
  and r.position > 24;

-- Atomic admin operation (thao tác nguyên tử: ghi đủ hoặc không ghi dở dang)
-- used by the admin UI when a module needs its next batch of books.
create or replace function public.admin_assign_homepage_module_books(p_limit integer default 24)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 24), 100));
  v_inserted integer := 0;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  with ranked as (
    select b.id as book_id, m.id as module_id,
      row_number() over (
        partition by m.id
        order by
          case when m.slug = 'grab-save'
            then case when b.inventory_quantity > b.reserved_inventory_quantity then 0 else 1 end
            else 0 end,
          case when m.slug = 'new-upcoming' then b.publication_date end desc nulls last,
          case when m.slug = 'grab-save' then b.sale_price_vnd end asc nulls last,
          b.created_at desc,
          b.id
      ) as position
    from public.books b
    cross join public.homepage_modules m
    where b.status = 'active'
      and b.is_visible_website = true
      and m.is_active = true
  ), inserted as (
    insert into public.book_homepage_modules (book_id, module_id, sort_order)
    select book_id, module_id, position::int
    from ranked
    where position <= v_limit
    on conflict (book_id, module_id) do nothing
    returning 1
  )
  select count(*)::integer into v_inserted from inserted;

  with ranked_links as (
    select
      l.book_id,
      l.module_id,
      row_number() over (
        partition by l.module_id
        order by l.sort_order, l.book_id
      ) as position
    from public.book_homepage_modules l
    join public.homepage_modules m on m.id = l.module_id
    where m.is_active = true
  )
  delete from public.book_homepage_modules l
  using ranked_links r
  where l.book_id = r.book_id
    and l.module_id = r.module_id
    and r.position > v_limit;

  return v_inserted;
end;
$$;

revoke all on function public.admin_assign_homepage_module_books(integer) from public;
grant execute on function public.admin_assign_homepage_module_books(integer) to authenticated;

commit;
