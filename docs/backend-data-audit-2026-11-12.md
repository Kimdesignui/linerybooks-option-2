# Linery backend data audit — 2026-11-12

## Kết luận nhanh

Frontend hiện đã có client Supabase và đọc catalog public từ các quan hệ `books`, `book_images`, `creators`, `book_creators`, `taxonomy_terms`, `book_taxonomy_terms`, `homepage_modules` và `book_homepage_modules`. News hiện đã có loader Supabase và vẫn fallback về dữ liệu demo nếu bảng chưa được apply.

Migration cần chạy là:

`supabase/migrations/20261112_create_storefront_operations_and_menus.sql`

Trong lần kiểm tra trực tiếp ngày 12/11/2026, các bảng catalog `books`, `creators`, `taxonomy_terms` trả HTTP 200 và có dữ liệu thật. Các bảng mới như `news_posts`, `site_menus` chưa tồn tại trên project thật và trả PostgREST `PGRST205`/HTTP 404 vì migration vận hành chưa được apply. Không coi build thành công là bằng chứng toàn bộ database đã chạy.

## Ma trận dữ liệu

| Khu vực | Trước audit | Thiết kế dữ liệu | Trạng thái code |
|---|---|---|---|
| Sách, bìa, giá, tồn kho | Demo + catalog schema | `books`, `book_images` | Đã có loader public; cần apply schema/seed |
| Tác giả, dịch giả, họa sĩ | Demo + catalog schema | `creators`, `creator_roles`, `book_creators`, `creator_images` | Đã có loader creator; route public dùng `/creators` |
| Danh mục, NXB, line, format | Demo + taxonomy schema | `taxonomy_terms`, `book_taxonomy_terms` | Đã có loader; filter dùng dữ liệu catalog |
| Mô-đun trang chủ | Demo module + SQL module | `homepage_modules`, `book_homepage_modules` | Đã có loader; cần apply seed |
| Banner/media | UI admin + SQL media | `site_media_assets`, `site_banners`, Storage `site-media` | Đã có query/upload admin; cần apply migration |
| News/eMagazine | Hardcode `newsItems` | `news_posts` | Đã thêm loader Supabase, fallback demo |
| Header/footer menu | Hardcode trong React | `site_menus`, `site_menu_items` | Đã thêm migration + seed; admin route `/admin/menus` |
| Customer/auth | UI demo | `customer_profiles` gắn `auth.users` | Đã thêm schema; chưa bật flow auth server |
| Cart | React memory | `carts`, `cart_items` | Đã thêm schema; chưa chuyển thao tác UI sang API |
| Đơn hàng/checkout | Demo/localStorage | `orders`, `order_items`, `order_payments` | Đã thêm schema; chưa cho browser tự xác nhận thanh toán |
| Wishlist | localStorage | `wishlists`, `wishlist_items` | Đã thêm schema; cần chuyển handler sang API |
| Review | Nội dung demo | `book_reviews` | Đã thêm schema + public policy đọc review approved |
| Payment method | Hardcode checkout | `payment_methods` | Đã thêm schema + seed; secret/provider config vẫn phải ở backend |
| Site settings | Hardcode footer/UI | `site_settings` | Đã thêm schema; chưa chuyển toàn bộ component sang loader |

## Nguyên tắc ghép backend

- Frontend dùng `book.id`, `creator.id`, `taxonomy_terms.id`, `homepage_modules.id`; không dùng title làm khóa dữ liệu.
- Giá, tồn kho, discount, delivery fee và total phải tính lại trong backend khi tạo order.
- Payment chỉ chuyển sang `paid` từ webhook/provider callback hoặc quy trình đối soát ngân hàng đã xác minh.
- Guest cart dùng `guest_token`; tài khoản đăng nhập dùng `auth.users.id`.
- Menu quản trị tách hai vị trí: `header` và `footer`, mỗi item có `parent_id`, `sort_order`, `href`, `item_type`, `is_active`.
- Các policy demo/public trong migration chỉ đủ cho môi trường ghép UI; trước production cần đổi thao tác insert/update admin sang role/backend server có kiểm soát quyền.

## Kiểm thử đã chạy

- `npm install`: thành công.
- `npm run build:enhanced`: thành công.
- `git diff --check`: thành công.
- REST Supabase: catalog public đã đọc được dữ liệu thật; `news_posts`/menu và các bảng vận hành mới còn trả `404`.
- Browser smoke test enhanced homepage: tải được dữ liệu catalog thật và render 288 product-card links; chỉ còn request `news_posts` 404 do bảng chưa được apply.

Frontend anon key chỉ đọc được dữ liệu public, không có quyền chạy DDL. Cần apply `supabase/migrations/20261112_create_storefront_operations_and_menus.sql` trong Supabase SQL Editor hoặc qua Supabase CLI đã xác thực, sau đó lặp lại smoke test và kiểm tra CRUD.
