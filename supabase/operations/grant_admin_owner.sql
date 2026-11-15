-- Cấp quyền quản trị cao nhất cho một tài khoản đã tồn tại trong Supabase Auth.
-- Thay EMAIL_CUA_BAN bằng đúng email đăng nhập trang quản trị.
-- Chạy trong Supabase SQL Editor (trình soạn thảo SQL của Supabase).

do $$
declare
  target_user_id uuid;
begin
  select id
    into target_user_id
  from auth.users
  where lower(email) = lower('EMAIL_CUA_BAN')
  limit 1;

  if target_user_id is null then
    raise exception 'Không tìm thấy tài khoản Auth với email đã nhập.';
  end if;

  insert into public.admin_users (user_id, role)
  values (target_user_id, 'owner')
  on conflict (user_id) do update
    set role = 'owner';
end;
$$;

-- Kiểm tra kết quả sau khi cấp quyền.
select au.user_id, au.role, u.email
from public.admin_users au
join auth.users u on u.id = au.user_id
where lower(u.email) = lower('EMAIL_CUA_BAN');
