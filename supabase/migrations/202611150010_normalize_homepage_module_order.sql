begin;

-- Normalize existing merchandising order before adding the invariant. The
-- temporary offset prevents collisions while rows are being renumbered.
delete from public.book_homepage_modules l
using public.books b
where l.book_id = b.id
  and (b.status <> 'active' or b.is_visible_website is not true);

with ordered as (
  select
    l.ctid,
    row_number() over (
      partition by l.module_id
      order by l.sort_order, l.book_id
    ) as position
  from public.book_homepage_modules l
  join public.homepage_modules m on m.id = l.module_id
)
update public.book_homepage_modules l
set sort_order = 2000000 + ordered.position
from ordered
where l.ctid = ordered.ctid;

with ordered as (
  select
    l.ctid,
    row_number() over (
      partition by l.module_id
      order by l.sort_order, l.book_id
    ) as position
  from public.book_homepage_modules l
  join public.homepage_modules m on m.id = l.module_id
)
update public.book_homepage_modules l
set sort_order = ordered.position::int
from ordered
where l.ctid = ordered.ctid;

do $$
begin
  alter table public.book_homepage_modules
    add constraint book_homepage_modules_sort_order_positive check (sort_order > 0);
exception
  when duplicate_object then null;
end;
$$;

create unique index if not exists book_homepage_modules_module_sort_unique
  on public.book_homepage_modules (module_id, sort_order);

-- Keep the same invariant for later admin assignments. New rows are inserted
-- outside the visible range, then the active module is compacted to 1..N.
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
    select book_id, module_id, (1000000 + position)::int
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

  with ordered as (
    select
      l.ctid,
      row_number() over (
        partition by l.module_id
        order by l.sort_order, l.book_id
      ) as position
    from public.book_homepage_modules l
    join public.homepage_modules m on m.id = l.module_id
    where m.is_active = true
  )
  update public.book_homepage_modules l
  set sort_order = 2000000 + ordered.position
  from ordered
  where l.ctid = ordered.ctid;

  with ordered as (
    select
      l.ctid,
      row_number() over (
        partition by l.module_id
        order by l.sort_order, l.book_id
      ) as position
    from public.book_homepage_modules l
    join public.homepage_modules m on m.id = l.module_id
    where m.is_active = true
  )
  update public.book_homepage_modules l
  set sort_order = ordered.position::int
  from ordered
  where l.ctid = ordered.ctid;

  return v_inserted;
end;
$$;

revoke all on function public.admin_assign_homepage_module_books(integer) from public;
grant execute on function public.admin_assign_homepage_module_books(integer) to authenticated;

commit;
