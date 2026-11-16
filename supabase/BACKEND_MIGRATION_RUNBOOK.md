# LineryBooks backend migration runbook

Tài liệu này dùng để áp dụng backend thật vào project Supabase `linerybooks-backend`.

## Thứ tự áp dụng

Nếu là project Supabase mới, chạy toàn bộ baseline (nền schema và dữ liệu nền)
theo thứ tự trước khi chạy nhóm backend vận hành:

1. `20261112_create_site_media_and_banner_storage.sql`
2. `20261112_create_storefront_operations_and_menus.sql`
3. `20261112_align_public_catalog_for_storefront.sql`
4. `20261113_create_emagazine_blocks.sql`
5. `20261113_seed_standard_news_posts.sql`
6. `20261114_add_book_sample_pdf.sql`
7. `20261114_optimize_public_catalog.sql`
8. `20261114_reseed_news_demo_content.sql`
9. `20261115_add_creator_academic_title.sql`
10. `20261115_link_catalog_covers_to_storage.sql`
11. `20261115_normalize_creator_images_to_host.sql`
12. `20261115_normalize_additional_creator_images_to_host.sql`
13. `20261115_remove_remaining_external_creator_images.sql`

Project đang dùng đã có baseline này; verifier (bộ kiểm tra tự động) xác nhận các bảng
đã tồn tại. Với project hiện tại, chạy tiếp các migration vận hành sau:

14. `20261115_enable_real_storefront_operations.sql`
   - tạo `admin_users` và hàm `is_admin()` (kiểm tra quyền quản trị);
   - khóa các đường ghi demo trên media và bật policy quản trị.
15. `20261115_admin_operations_and_imports.sql`
   - tạo địa điểm, khu vực giao hàng, quick prompts và lô import sách;
   - bật RLS (Row Level Security - cơ chế giới hạn dữ liệu theo quyền).
16. `20261115_complete_transactional_backend.sql`
   - tạo tồn kho, lịch sử trạng thái đơn, khuyến mãi;
   - thay RPC tạo đơn bằng luồng kiểm tra tồn kho và khuyến mãi thật.
17. `20261115_assign_24_books_per_homepage_module.sql`
   - bổ sung tối đa 24 sách khác nhau cho mỗi mô đun đang hoạt động;
   - tạo RPC `admin_assign_homepage_module_books(integer)` cho admin.
18. `20261115_news_metadata_and_history.sql`
   - thêm metadata SEO, trạng thái nổi bật/trang chủ và định dạng bài;
   - tạo lịch sử chỉnh sửa bài viết trong `news_post_history`.
19. `20261115_seed_hosted_site_banners.sql`
   - đăng ký hai ảnh hero đang được deploy cùng frontend vào `site_media_assets`;
   - liên kết chúng với vị trí `HOME_HERO` trong `site_banners`.
20. `20261115_normalize_homepage_module_order.sql`
   - chuẩn hóa `sort_order` của từng mô-đun về chuỗi liên tục;
   - ngăn không cho hai sách trong cùng mô-đun dùng cùng một vị trí carousel.
21. `20261115_admin_user_management.sql`
   - tạo bảng quyền quản trị và các hàm cấp/gỡ quyền;
   - gán tài khoản chủ sở hữu sau khi tài khoản đó đã tồn tại trong Supabase Auth (hệ thống tài khoản).
22. `20261116_allow_admin_book_writes.sql`
   - cấp quyền cho quản trị viên tạo, sửa và xóa sách, ảnh sách, liên kết người sáng tạo, phân loại và mô-đun trang chủ;
   - giữ nguyên RLS (Row Level Security - cơ chế giới hạn dữ liệu theo quyền), chỉ tài khoản quản trị mới được ghi.
23. `20261116_seed_pages_public_site_configuration.sql`
   - đăng ký metadata của logo, favicon và hai hero asset đang nằm trong bundle Cloudflare Pages;
   - seed `site_name`, `site_logo` và `site_favicon` để storefront đọc cùng nguồn với admin.
24. `20261116_admin_roles_and_permissions.sql`
25. `20261116_enforce_admin_permissions.sql`
   - tạo ma trận role/permission cho `Super Admin`, `Admin quản trị hệ thống`, `Nhân viên kinh doanh` và `Biên tập viên`;
   - nâng cấp `admin_users`, cấp RPC gán/đổi/gỡ vai trò và trả quyền của phiên đăng nhập;
   - chạy sau khi tài khoản Supabase Auth đầu tiên đã có trong `admin_users`.

Các file đều dùng `if not exists`, `create or replace` và `on conflict` ở các điểm cần thiết để có thể chạy lại an toàn. Không chọn “Run without RLS”; nếu Supabase hiện cảnh báo, chọn “Run and enable RLS”.

## Kiểm tra sau khi chạy

Từ thư mục project, chạy:

```text
npm run verify:supabase-backend
npm run verify:homepage-modules
npm run verify:hosted-images
npm run verify:news-metadata
```

Kết quả đạt yêu cầu khi:

- không còn bảng vận hành hoặc RPC bị báo `404`;
- mỗi mô đun active có ít nhất 24 `book_id` duy nhất;
- không có duplicate (bản ghi trùng) trong quan hệ module;
- mỗi mô-đun active có `sort_order` duy nhất, không bị trùng vị trí slide;
- không còn URL ảnh bên ngoài trong các bảng catalog, creator, news và media;
- metadata tin tức và bảng lịch sử trả về dữ liệu thật sau khi migration tương ứng đã chạy;
- build frontend vẫn thành công bằng `npm run build`.

Không coi migration là hoàn tất chỉ vì SQL Editor báo chạy xong; phải chạy cả hai verifier và kiểm tra lại admin/storefront bằng tài khoản thật.
