-- Inventory (tồn kho) is an operational workflow, not a catalog field.
-- New books start at zero; receipts/adjustments are recorded here instead.
create or replace function public.admin_adjust_inventory(
  p_book_id uuid,
  p_quantity_delta integer,
  p_note text default null
)
returns table(book_id uuid, inventory_quantity integer, reserved_inventory_quantity integer, available_quantity integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_book public.books;
  v_type text;
begin
  if not public.admin_has_permission('inventory.manage') then
    raise exception 'INVENTORY_PERMISSION_REQUIRED';
  end if;
  if coalesce(p_quantity_delta, 0) = 0 then
    raise exception 'INVENTORY_DELTA_REQUIRED';
  end if;

  select * into v_book from public.books where id = p_book_id for update;
  if not found then raise exception 'BOOK_NOT_FOUND'; end if;
  if coalesce(v_book.inventory_quantity, 0) + p_quantity_delta < coalesce(v_book.reserved_inventory_quantity, 0) then
    raise exception 'INVENTORY_CANNOT_BE_BELOW_RESERVED';
  end if;

  v_type := case when p_quantity_delta > 0 then 'receipt' else 'adjustment' end;
  update public.books
    set inventory_quantity = coalesce(inventory_quantity, 0) + p_quantity_delta,
        updated_at = now()
    where id = p_book_id
    returning * into v_book;

  insert into public.inventory_transactions(book_id, transaction_type, quantity_delta, note, created_by)
  values (p_book_id, v_type, p_quantity_delta, nullif(trim(p_note), ''), auth.uid());

  return query select v_book.id, v_book.inventory_quantity, v_book.reserved_inventory_quantity,
    greatest(v_book.inventory_quantity - v_book.reserved_inventory_quantity, 0);
end;
$$;

revoke all on function public.admin_adjust_inventory(uuid, integer, text) from public;
grant execute on function public.admin_adjust_inventory(uuid, integer, text) to authenticated;

-- The catalog permission describes catalog data only; stock belongs to inventory.manage.
update public.admin_permissions
set description = 'Cập nhật thông tin và giá sách; tồn kho được điều chỉnh tại Quản lý kho.'
where permission_key = 'books.update';
