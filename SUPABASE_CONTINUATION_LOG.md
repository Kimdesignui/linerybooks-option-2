# LineryBooks — Nhật ký bàn giao tiếp tục trên máy A

> Cập nhật: 16/11/2026 (múi giờ Asia/Bangkok)
>
> File này ghi lại trạng thái triển khai backend (phần xử lý dữ liệu phía máy chủ), các việc chưa hoàn thành và cách kiểm tra. Không ghi mật khẩu, mã truy cập hoặc khóa bí mật vào đây.

## 1. Mục tiêu còn dang dở

Hoàn thiện toàn bộ hệ thống Supabase (cơ sở dữ liệu và dịch vụ dữ liệu trực tuyến) cho website LineryBooks, đồng bộ với frontend (giao diện người dùng) và admin (khu vực quản trị), sau đó kiểm tra bằng dữ liệu thật.

Trạng thái hiện tại: **chưa hoàn tất trên môi trường live (môi trường đang chạy thật)**.

## 2. Việc đã thực hiện trong mã nguồn

- Màn **Thêm sách** tự lưu bản nháp khi người dùng nhập dữ liệu rồi chuyển sang màn hình khác. Bản nháp gồm tiêu đề, ISBN, giá, tác giả, phân loại, mô-đun trang chủ, trạng thái hiển thị và ảnh bìa nếu dung lượng trình duyệt cho phép.
- Màn **Quản lý sách** đã đọc toàn bộ bản ghi từ Supabase, gồm cả sách nháp và sách chưa hiển thị trên website; không còn chỉ đọc danh mục công khai.
- Bổ sung kiểm tra ISBN chỉ gồm chữ số và tự loại ký tự khác.
- Bổ sung xử lý giá chỉ nhận chữ số và hiển thị phân tách số theo tiếng Việt.
- Bổ sung kết nối dữ liệu thật cho nhiều khu vực quản trị: đơn hàng, khách hàng, kho, khuyến mãi, địa điểm, thanh toán, menu, mô-đun trang chủ, tin tức, media và người sáng tạo.
- Bổ sung kiểm tra ảnh lưu trên hosting (nơi lưu trữ thật), không dùng đường dẫn ảnh ngoài ở các bảng đã kiểm tra.
- Bổ sung các bộ kiểm tra dữ liệu Excel, người sáng tạo và bản nháp màn thêm sách.

## 3. Migration (bản cập nhật cấu trúc cơ sở dữ liệu) chưa xác nhận trên Supabase thật

Các file sau đã có trong repo nhưng chưa được xác nhận đã chạy trên dự án Supabase thật:

1. `supabase/migrations/20261116_seed_excel_taxonomy_terms.sql`
2. `supabase/migrations/20261116_repair_creator_encoding_duplicates.sql`
3. `supabase/migrations/20261116_create_site_banner_positions.sql`

Migration quan trọng còn thiếu theo kiểm tra live:

- Bảng `site_banner_positions` đang trả HTTP `404`.
- Đây là lý do verifier (bộ kiểm tra tự động) vẫn báo backend chưa đủ.

## 4. Kết quả kiểm tra gần nhất

Đã đạt:

- `npm run build:enhanced` — đạt.
- `npm run verify:admin-book-draft` — đạt; dữ liệu bản nháp được phục hồi sau mô phỏng chuyển màn hình.
- `npm run verify:hosted-images` — đạt; không phát hiện đường dẫn ảnh ngoài trong các bảng được kiểm tra.
- Các bảng backend hiện có và các RPC (hàm xử lý trong cơ sở dữ liệu) chính đều phản hồi.

Còn lỗi:

- `npm run verify:supabase-backend` — còn thiếu `site_banner_positions`.
- `npm run verify:creator-data` — live database (cơ sở dữ liệu thật) còn 3 tên người sáng tạo bị lỗi mã hóa và 3 bản ghi rác; migration sửa dữ liệu đã có nhưng chưa xác nhận đã chạy live.

## 5. Vì sao chưa tự chạy được migration

- Công cụ Supabase chạy được qua `npx`, nhưng máy chưa có mã truy cập Supabase.
- Kết nối trực tiếp đến cơ sở dữ liệu bị lỗi vì mạng hiện tại không hỗ trợ IPv6.
- Không được tự ghi mật khẩu hoặc mã truy cập vào repo.
- Vì vậy chưa được coi là migration đã chạy chỉ dựa trên file SQL local.

## 6. Việc cần làm trên máy A

1. Mở đúng project Supabase `yixcddwurbmkzxqqtfnn` bằng phiên đã đăng nhập.
2. Mở SQL Editor (trình chạy câu lệnh cơ sở dữ liệu).
3. Chạy lần lượt ba migration trong mục 3, ưu tiên `20261116_create_site_banner_positions.sql`.
4. Chạy lại các lệnh:

```powershell
npm run verify:supabase-backend
npm run verify:hosted-images
npm run verify:excel-taxonomy
npm run verify:creator-data
npm run verify:homepage-modules
npm run verify:news-metadata
npm run build:enhanced
```

5. Nếu `verify:creator-data` còn báo lỗi, kiểm tra trực tiếp bảng `creators` và `book_creators`; không sửa bằng cách che lỗi ở giao diện.
6. Kiểm tra admin bằng tài khoản thật: thêm sách, chuyển sang màn khác, quay lại, lưu bản ghi; sau đó kiểm tra sách xuất hiện trong danh sách admin và website theo trạng thái đã chọn.
7. Chỉ sau khi các bước trên đạt mới commit và đẩy Git/Cloudflare.

## 8. Lỗi mới phát hiện sau khi thử lưu sách

Ngày 16/11/2026, màn **Thêm sách** đã gửi được dữ liệu nhưng Supabase trả lỗi `42501: new row violates row-level security policy for table "books"`.

Ý nghĩa: tài khoản đã vào được khu vực quản trị, nhưng phiên hiện tại chưa được chính sách RLS (cơ chế giới hạn dữ liệu theo quyền) cho phép ghi vào bảng `books`. Không được xử lý bằng cách tắt RLS toàn bảng.

Mã frontend đã được cập nhật để hiển thị rõ:

> Tài khoản đã đăng nhập nhưng chưa có quyền ghi sách trên Supabase. Hãy chạy migration `20261116_allow_admin_book_writes.sql` và đăng nhập quản trị lại.

Sau khi migration quyền ghi đã chạy, cần thử lại cả ba bước: tạo sách, tạo liên kết phân loại và kiểm tra sách xuất hiện trong danh sách quản trị.

## 9. Cập nhật quyền quản trị live

Ngày 16/11/2026, migration `20261116_allow_admin_book_writes.sql` đã được chạy trên Supabase thật.

Tài khoản `pt.thietke@gmail.com` đã được xác nhận trong `public.admin_users` với vai trò `owner` (chủ sở hữu quản trị). Không lưu mật khẩu hoặc mã truy cập vào repo.

Trạng thái hiện tại:

- Đã xác nhận quyền quản trị trong cơ sở dữ liệu thật.
- Đã xác nhận các chính sách ghi cho nhóm bảng sách được tạo lại theo `public.is_admin()` (hàm kiểm tra quyền quản trị).
- Cần kiểm thử cuối trên giao diện: đăng xuất/đăng nhập lại, tạo một sách mới, lưu, rồi kiểm tra bản ghi trong danh sách quản trị.
- Chưa kết luận hoàn tất backend live cho đến khi bước lưu sách thật đạt.

## 7. Quy tắc bàn giao

- Không coi build (biên dịch mã nguồn) đạt là đồng nghĩa với backend live đã đạt.
- Không xóa các migration hoặc bộ kiểm tra hiện có.
- Không ghi thông tin đăng nhập, khóa API hoặc mã truy cập vào file này.
- Sau mỗi lần sửa tiếp, cập nhật phần “Kết quả kiểm tra gần nhất” trong file này.

## 10. Cập nhật flow thêm sách và cover — 16/11/2026

### Đã cập nhật frontend

- `src/App.tsx`:
  - Nút `Lưu sách` có trạng thái `Đang lưu…` trong lúc upload ảnh/PDF và ghi dữ liệu.
  - Khóa nút lưu và nút nháp trong lúc đang xử lý để tránh gửi trùng bản ghi.
  - Sau khi `createAdminBook` hoàn tất, xóa bản nháp local, ghi thông báo thành công vào `sessionStorage`, rồi chuyển bằng `window.location.replace('/admin/books')`.
  - Có chuyển hướng dự phòng sau 1,2 giây nếu trình duyệt không rời khỏi màn `/admin/books/new`.
  - Nếu lưu lỗi, lỗi vẫn hiển thị trực tiếp ở đầu form và phát thông báo lỗi rõ ràng.
  - Màn danh sách sách đọc thông báo thành công sau redirect và hiển thị banner `Đã lưu sách và các liên kết vào Supabase.`.

### Đã cập nhật xử lý cover/backend mapping

- `src/lib/supabase-data.ts`:
  - Cover trong `book_images` được tin theo quan hệ `book_images.book_id` trước tiên; không loại ảnh đã liên kết chỉ vì tên file cũ chứa ISBN khác.
  - File cover mới vẫn bị chặn trước khi upload nếu tên file chứa ISBN không khớp ISBN sách.
  - Giữ rollback (hoàn tác) sách và file storage nếu bước liên kết tác giả, phân loại hoặc mô-đun trang chủ thất bại.
  - Sửa tính `sort_order` theo từng mô-đun để không lặp khóa unique khi thêm sách vào mô-đun trang chủ.

### Đối soát dữ liệu sau khi xóa bản ghi test

- Đã kiểm tra trực tiếp Supabase: các bản ghi `Test` và `TestABC` không còn trong danh sách sách.
- Catalog hiện còn 8 sách thật; các bản ghi đều có `cover_storage_path`.
- Bản ghi `Test` trước đó trỏ tới object storage trả HTTP 400; không tìm thấy file nguồn trong workspace nên không tự phục hồi bằng ảnh khác.
- Không tự chèn thêm sách test trong lượt kiểm tra này.

### Kết quả kiểm tra sau cập nhật

- `git diff --check` — đạt.
- `npm run build:enhanced` — đạt; chỉ còn cảnh báo chunk lớn do PDF/TTS runtime.
- `npm run test:qa` — đạt: 9 route × 2 viewport, không lỗi shell, runtime, console hoặc tràn ngang.
- `npm run verify:supabase-backend` — các bảng và cột backend cần cho sách, ảnh, tác giả, phân loại và quyền quản trị phản hồi khả dụng.

### Việc cần kiểm tra trên máy B

1. Kéo commit mới nhất và chạy `npm install` nếu lockfile/package cache khác máy A.
2. Mở `/admin/books/new`, nhập một sách mới với ISBN 13 số, chọn tác giả/phân loại hợp lệ và upload cover.
3. Bấm `Lưu sách`; phải thấy `Đang lưu…`, sau đó tự về `/admin/books` và thấy banner thành công.
4. Kiểm tra dòng sách mới có cover thật, ISBN, tác giả, số lượng và giá đúng.
5. Nếu lỗi, ghi nguyên văn banner lỗi và thời điểm vào log; không xóa bản ghi hoặc file storage để che lỗi.

