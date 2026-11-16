# LineryBooks — Nhật ký bàn giao tiếp tục trên máy A

> Cập nhật: 17/11/2026 (múi giờ Asia/Bangkok)
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
- Bổ sung kiểm tra lưu sách thật: `npm run verify:admin-book-save -- 9781234567891` đối chiếu bản ghi sách, giá, tồn kho, mô tả và các liên kết creator/phân loại/mô đun trang chủ.

## 3. Migration (bản cập nhật cấu trúc cơ sở dữ liệu) chưa xác nhận trên Supabase thật

Các file sau đã có trong repo nhưng chưa được xác nhận đã chạy trên dự án Supabase thật:

1. `supabase/migrations/20261116_seed_excel_taxonomy_terms.sql`
2. `supabase/migrations/20261116_repair_creator_encoding_duplicates.sql`
3. `supabase/migrations/20261116_create_site_banner_positions.sql`

Migration quan trọng còn thiếu theo kiểm tra live:

- Bảng `site_banner_positions` đang trả HTTP `404` ở lần kiểm tra gần nhất.
- Bộ kiểm tra đã được bổ sung bảng này để không bỏ sót khi đối soát lần tiếp theo.

## 4. Kết quả kiểm tra gần nhất

Đã đạt:

- `npm run build:enhanced` — đạt.
- `npm run verify:admin-book-draft` — đạt; dữ liệu bản nháp được phục hồi sau mô phỏng chuyển màn hình.
- `npm run verify:hosted-images` — đạt; không phát hiện đường dẫn ảnh ngoài trong các bảng được kiểm tra.
- Các bảng backend hiện có và các RPC (hàm xử lý trong cơ sở dữ liệu) chính đều phản hồi.

Còn lỗi:

- `npm run verify:supabase-backend` — còn thiếu `site_banner_positions` ở lần kiểm tra gần nhất.
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

5. Nếu `verify:creator-data` còn báo lỗi, kiểm tra trực tiếp bảng `creators` và `book_creators`; không sửa bằng cách che lỗi ở giao diện. Migration sửa 3 bản ghi trùng mã hóa có thao tác xóa bản ghi lỗi, nên phải xác nhận trước khi chạy.
6. Kiểm tra admin bằng tài khoản thật: thêm sách, chuyển sang màn khác, quay lại, lưu bản ghi; sau đó kiểm tra sách xuất hiện trong danh sách admin và website theo trạng thái đã chọn.
7. Chỉ sau khi các bước trên đạt mới commit và đẩy Git/Cloudflare.

## 8. Lỗi mới phát hiện sau khi thử lưu sách

Ngày 16/11/2026, màn **Thêm sách** đã gửi được dữ liệu nhưng Supabase trả lỗi `42501: new row violates row-level security policy for table "books"`.

Ý nghĩa: tài khoản đã vào được khu vực quản trị, nhưng phiên hiện tại chưa được chính sách RLS (cơ chế giới hạn dữ liệu theo quyền) cho phép ghi vào bảng `books`. Không được xử lý bằng cách tắt RLS toàn bảng.

Mã frontend đã được cập nhật để hiển thị rõ:

> Tài khoản đã đăng nhập nhưng chưa có quyền ghi sách trên Supabase. Hãy chạy migration `20261116_allow_admin_book_writes.sql` và đăng nhập quản trị lại.

Sau khi migration quyền ghi đã chạy, cần thử lại cả ba bước: tạo sách, tạo liên kết phân loại và kiểm tra sách xuất hiện trong danh sách quản trị.

## 13. Kiểm thử lưu sách thật — 16/11/2026

- Đã nhập và lưu thành công hai bản ghi kiểm thử qua giao diện quản trị local, không gọi thẳng API để thay thế thao tác người dùng.
- ISBN `9781234567890`: giá bìa USD đã sửa về `12.50`, giá bán `460000`, tồn kho `12`.
- ISBN `9781234567891`: giá bìa USD `12.50`, giá bán `470000`, tồn kho `8`.
- Cả hai bản ghi đều có liên kết tác giả Edward W. Said, 8 liên kết phân loại/thuộc tính, mô đun New & Upcoming và mô tả trong Supabase.
- Đã phát hiện và sửa lỗi ô USD biến `12.50` thành `1250`; giá VNĐ vẫn giữ quy tắc số nguyên có phân tách hàng nghìn.

## 9. Cập nhật quyền quản trị live

Ngày 16/11/2026, migration `20261116_allow_admin_book_writes.sql` đã được chạy trên Supabase thật.

Tài khoản `pt.thietke@gmail.com` đã được xác nhận trong `public.admin_users` với vai trò `owner` (chủ sở hữu quản trị). Không lưu mật khẩu hoặc mã truy cập vào repo.

Trạng thái hiện tại:

- Đã xác nhận quyền quản trị trong cơ sở dữ liệu thật.
- Đã xác nhận các chính sách ghi cho nhóm bảng sách được tạo lại theo `public.is_admin()` (hàm kiểm tra quyền quản trị).
- Cần kiểm thử cuối trên giao diện: đăng xuất/đăng nhập lại, tạo một sách mới, lưu, rồi kiểm tra bản ghi trong danh sách quản trị.
- Chưa kết luận hoàn tất backend live cho đến khi bước lưu sách thật đạt.

## 10. Khắc phục lệch môi trường giữa máy A và máy B

Nguyên nhân đã xác định: lệnh `npm run dev` trước đây chạy Vite không chỉ định `enhanced`, trong khi `.env.enhanced` mới chứa cấu hình Supabase cho bản backend thật. Máy dùng lệnh mặc định có thể rơi vào bản không kết nối Supabase.

Đã chỉnh `package.json`:

- `npm run dev` mặc định chạy `vite --mode enhanced` trên cổng `5174`.
- `npm run build` mặc định build với `--mode enhanced`.
- Bản giao diện cũ vẫn dùng riêng `npm run dev:classic` trên cổng `5173`.

## 11. Thông báo quản trị

Đã thêm migration `supabase/migrations/20261116_admin_notifications.sql` để tạo bảng thông báo quản trị, chính sách đọc/cập nhật theo người nhận và trigger (cơ chế tự chạy khi có dữ liệu mới) cho đơn hàng và đánh giá mới.

Đã xác nhận migration trên Supabase thật: REST (giao diện gọi dữ liệu) trả `401` cho `admin_notifications`, nghĩa là bảng đã tồn tại nhưng bị bảo vệ khi chưa có phiên đăng nhập hợp lệ; đây không còn là lỗi `404` thiếu bảng. Bộ kiểm tra đã được cập nhật để phân biệt `MISSING` (thiếu thật) với `EXISTS_OR_AUTH_REQUIRED` (đã tồn tại hoặc cần đăng nhập).

Nút chuông quản trị vẫn cần được kiểm tra tiếp bằng phiên admin thật sau khi đăng nhập, rồi tạo một đơn hàng/đánh giá thử để xác nhận trigger (cơ chế tự chạy khi có dữ liệu mới) ghi thông báo.

## 7. Quy tắc bàn giao

- Không coi build (biên dịch mã nguồn) đạt là đồng nghĩa với backend live đã đạt.
- Không xóa các migration hoặc bộ kiểm tra hiện có.
- Không ghi thông tin đăng nhập, khóa API hoặc mã truy cập vào file này.
- Sau mỗi lần sửa tiếp, cập nhật phần “Kết quả kiểm tra gần nhất” trong file này.

## 10. Cập nhật flow thêm sách và cover — 16/11/2026

### Đã cập nhật frontend

- `src/App.tsx`:
  - Trang thêm sách không còn thẻ điều hướng ba tab “Thông tin sách”, “Ảnh bìa”, “Mô tả”; các phần nhập liệu vẫn giữ nguyên trong một luồng liên tục, bớt một lớp giao diện trung gian.
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

## 12. Đối soát máy A và máy B — 16/11/2026

Đã kiểm tra trực tiếp cùng workspace bằng hai môi trường Vite (công cụ chạy giao diện):

- `classic` (bản cũ) chỉ nạp `VITE_LINERY_VARIANT=classic`; không nạp `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`, nên biến kết nối Supabase bị rỗng và không thể lưu sách thật.
- `enhanced` nạp đủ hai biến Supabase; bản local ở cổng `5174` mở được `/admin/books/new`, hiển thị nút thêm nhanh và biểu mẫu kết nối backend.
- `origin/main` (nhánh Git từ xa) tại thời điểm kiểm tra chưa có ba commit local mới nhất. Vì vậy máy B kéo từ `origin/main` hoặc bản Cloudflare chưa được triển khai lại có thể vẫn chạy cấu hình cũ.

Kết luận: trước tiên máy B phải dùng đúng commit mới và chạy `npm run dev` để mặc định vào `enhanced` trên cổng `5174`. Nếu vẫn không lưu được sau bước này, cần đối chiếu tài khoản đăng nhập của máy B với quyền `books.create` (quyền tạo sách) trong Supabase; đó là lớp kiểm tra quyền riêng theo tài khoản, không phải lỗi giao diện.

Sau commit `f8ef1e2`, màn đăng nhập quản trị sẽ hiển thị rõ tên môi trường đang chạy nếu Supabase chưa được cấu hình, thay vì chỉ báo lỗi chung. Nhờ đó có thể nhận biết ngay máy B đang chạy nhầm `classic` hay chưa.

## 13. Kiểm thử nhập sách thật và đối soát live — 16/11/2026

Đã dùng giao diện quản trị đang đăng nhập để nhập và lưu hai bản ghi sách thật vào Supabase, không gọi dữ liệu giả:

- ISBN `9781234567890`: giá bìa USD `12.50`, giá bán `460000`, tồn kho `12`.
- ISBN `9781234567891`: giá bìa USD `12.50`, giá bán `470000`, tồn kho `8`.
- Cả hai bản ghi đều có tác giả, 8 liên kết phân loại, mô-đun trang chủ, mô tả và trạng thái hiển thị.
- Bộ kiểm tra `verify:admin-book-save` xác nhận toàn bộ điều kiện đều `true` cho cả hai ISBN.

Đã sửa lỗi giá USD bị biến `12.50` thành `1,250`; nay giữ đúng phần thập phân. Giá VND vẫn chỉ nhận số nguyên dương và tự định dạng dấu phân cách.

Đã chạy trực tiếp trên Supabase:

- Tạo bảng `site_banner_positions`, nạp các vị trí banner hiện có và bật chính sách đọc công khai/quản trị có kiểm soát.
- Dọn 3 tên tác giả lỗi mã hóa và chuyển liên kết sách sang bản ghi đúng; vô hiệu hóa các bản ghi rác không có sách.

Kết quả sau cùng:

- `verify:supabase-backend`: toàn bộ bảng/cột/RPC chính khả dụng; `site_banner_positions` đã từ `404` thành `200`.
- `verify:creator-data`: `Mojibake names: 0`, `Known import artefacts: 0`; còn 18 tác giả chưa có ảnh và 1 tác giả đang hoạt động chưa gắn sách, cần quyết định dữ liệu riêng.
- `build`: đạt; chỉ còn cảnh báo chunk lớn do runtime PDF/TTS.
- `test:qa`: đạt 9 đường dẫn × 2 kích thước màn hình, không lỗi shell, runtime, console hoặc tràn ngang.

Sau đó đã xác minh `agb` là bản ghi không có sách liên kết và đã chuyển sang `is_active = false` trên Supabase, không xóa dữ liệu. Kết quả mới: `Active unused creators: 0`, `Known import artefacts: 0`, `Mojibake names: 0`; còn 18 hồ sơ thật chưa có ảnh nguồn.

Danh sách 18 hồ sơ cần bổ sung ảnh thật trên Storage (kho lưu trữ tệp): Genevieve Valentine, Benjamin Percy, Seana McGuire, Jeffery Ford, Josh Malerman, Karen Heuler, Stephen Graham Jones, M. Rickert, Elizabeth Hand, Carmen Maria Machado, John Langan, Paul Tremblay, Richard Kadrey, Ag, Zarghuna Kargar, Ayn Rand, Bao Ninh và H. E. Bates.

Đã kiểm tra trực tiếp trang quản trị `/admin/authors`: các hồ sơ này hiện thực sự trỏ tới `/assets/author-avatar-placeholder.png`, không phải ảnh lưu trên Supabase. Không tự gán ảnh không xác minh được danh tính.

## 14. Bổ sung ảnh tác giả thật và kiểm thử nhập liệu — 17/11/2026

- Đã dùng màn quản trị đang đăng nhập để upload (tải lên) ảnh thật cho `Bao Ninh` và `Carmen Maria Machado`.
- Cả hai ảnh sau khi lưu đều trả về URL công khai trong Supabase Storage (kho lưu trữ tệp), không còn trỏ tới ảnh mặc định.
- Lượt upload `Josh Malerman` bị trình duyệt hết thời gian chờ khi bấm lưu; chưa tính là thành công và chưa ghi nhận ảnh này.
- `verify:creator-data` sau lượt này: 188 creators, 173 creator images, còn 16 hồ sơ thiếu ảnh; không còn tên lỗi mã hóa, hồ sơ rác hoặc creator hoạt động không có sách.

Đã chạy một lượt nhập sách thật từ `/admin/books/new`:

- ISBN `9781234567893`, tên `Kiểm thử lưu thủ công 20261116 D`.
- Giá bìa USD `14.75`, giá bán `495000`, giá so sánh `535000`, tồn kho `18`, ngày xuất bản `2026-11-16`.
- Đã chọn thật `Bao Ninh`, `Carmen Maria Machado`, `Josh Malerman`, `Picador`, `English`, `Paperback`, `Nonfiction`, `Poetry & Drama`, `Fiction`, `International Literature`, `Penguin Random House` và ghi mô tả.
- Bản ghi đã xuất hiện trong danh sách quản trị và Supabase xác nhận: giá, tồn kho, mô tả, 3 liên kết creator và 7 liên kết phân loại đều đúng.
- Không chọn mô-đun trang chủ ở lượt D, nên `homepageModuleLinks = 0`; lượt ISBN `9781234567890` trước khi dọn dữ liệu kiểm thử đã xác nhận đủ mô-đun trang chủ và toàn bộ điều kiện kiểm tra đều đạt.

Đã sửa tiện ích `scripts/verify-admin-book-save.mjs`: không còn cố định giá USD mẫu `12.50`, mà kiểm tra giá dương và quan hệ giá so sánh lớn hơn giá bán. Đây là sửa công cụ kiểm tra, không thay đổi dữ liệu sách.

## 15. Sửa số lượng sách trong mô-đun trang chủ — 17/11/2026

- Kiểm tra live phát hiện `New & Upcoming` có 26 liên kết thay vì 24; hai liên kết dư là hai bản ghi kiểm thử ISBN `9781234567890` và `9781234567891`.
- Đã xóa riêng hai liên kết khỏi `book_homepage_modules`, không xóa bản ghi sách.
- Kiểm tra lại: `New & Upcoming`, `Linery Press`, `Linery Picks` và `Grab & Save` đều có đúng 24 sách, không trùng thứ tự, không có sách ẩn.
- Kiểm tra workbook (tệp Excel nguồn) thật `D:\AI-project\linery-books-google.xlsx`: có 227 dòng, nhưng cột Link đều là trang sản phẩm, không phải URL ảnh; vì vậy không dùng trực tiếp cột này làm ảnh Storage.

## 16. Kiểm thử nhập sách thật lần tiếp theo — 17/11/2026

- Đã tự điền và lưu qua giao diện `/admin/books/new` một bản ghi mới trong Supabase:
  - ISBN `9781234567894`, tên `Kiểm thử nhập liệu thật Linery 20261117`.
  - Giá bìa USD `15.75`, giá bán `510000`, giá so sánh `560000`, tồn kho `7`, số trang `320`.
  - Đã chọn `Bao Ninh`, `Carmen Maria Machado`, `Josh Malerman`, `English`, `Paperback`, `Nonfiction`, `Poetry & Drama`, `Fiction`, `International Literature`, `Penguin Random House`.
  - Lưu thành công, giao diện chuyển về `/admin/books` và hiện thông báo `Đã lưu sách và các liên kết vào Supabase.`
- Đối soát trực tiếp bản ghi theo ISBN xác nhận: giá, tồn kho, mô tả, 3 liên kết creator (người sáng tạo) và 7 liên kết phân loại đều đúng; không chọn mô-đun trang chủ nên không tạo liên kết mô-đun.
- Sửa `scripts/verify-admin-book-save.mjs`: mặc định chỉ kiểm tra mô-đun khi bản kiểm thử có yêu cầu; dùng cờ `--expect-home-module` nếu cần bắt buộc sách phải được gắn vào mô-đun trang chủ.
- Chạy lại sau sửa: `verify:admin-book-save`, `verify:supabase-backend`, `verify:hosted-images`, `verify:homepage-modules` và `build` đều đạt. Cảnh báo duy nhất là kích thước gói runtime PDF/TTS lớn, không làm hỏng build.

## 17. Bổ sung ảnh Josh Malerman và chặn dữ liệu đơn hàng tạm — 17/11/2026

- Đã dùng đúng phiên quản trị đang đăng nhập trên máy để mở `/admin/authors`, lọc `Josh Malerman`, chọn ảnh `.tmp-creator-images/josh-malerman.jpg` và lưu hồ sơ.
- Đối soát lại Supabase: số ảnh creator tăng từ 173 lên 174; hồ sơ thiếu ảnh giảm từ 16 xuống 15. Ảnh đã được lưu vào Storage (kho lưu trữ tệp), không dùng ảnh mặc định.
- Sửa luồng đặt hàng phía người dùng: khi Supabase chưa kết nối, hệ thống không còn ghi vào `localStorage` (bộ nhớ tạm của trình duyệt) rồi báo thành công. Hệ thống sẽ báo lỗi rõ ràng và chỉ xóa giỏ hàng sau khi RPC (hàm xử lý phía cơ sở dữ liệu) tạo đơn thành công.
- Sửa màn `/admin/books/new`: truyền cấu hình `showTabs={false}` để thanh tab điều hướng không thể xuất hiện lại trên màn thêm sách.
- Kiểm tra sau thay đổi: `build`, `test:qa`, `verify:supabase-backend`, `verify:hosted-images`, `verify:homepage-modules` và `verify:admin-book-save` đều đạt.
- Còn 15 hồ sơ thiếu ảnh thật; chưa tự gán ảnh không xác minh được danh tính.

## 18. Sửa lưu metadata tin tức — 17/11/2026

- Phát hiện biểu mẫu tin tức trước đây dò trực tiếp các ô nhập trong DOM (cấu trúc giao diện), nên khi sửa bài có thể ghi đè SEO, trạng thái hiển thị, danh mục và định dạng bằng giá trị rỗng hoặc mặc định.
- Đã chuyển các trường SEO Title, SEO Keywords, SEO Description, hiển thị website, hiển thị trang chủ, tin nổi bật, danh mục và định dạng sang trạng thái biểu mẫu có kiểm soát; khi mở bài cũ sẽ nạp lại dữ liệu thật từ Supabase và khi lưu sẽ gửi đúng dữ liệu đó.
- Bổ sung trạng thái `isPublished` vào dữ liệu tin tức để phân biệt rõ bài đang xuất bản với bản nháp ở màn sửa.
- `build`, `test:qa`, `git diff --check` đều đạt. Kiểm tra backend Supabase vẫn đạt.
- Chưa thể hoàn tất thao tác nhập/lưu qua giao diện trong tab thử nghiệm riêng vì phiên đăng nhập cục bộ trả `Invalid login credentials`; không đoán hoặc thay đổi mật khẩu. Cần dùng phiên Chrome đang đăng nhập sẵn hoặc triển khai bản này rồi kiểm tra lại trên môi trường đã đăng nhập.
- Sau đó đã dùng đúng phiên Chrome quản trị đang đăng nhập sẵn để kiểm thử end-to-end (toàn bộ từ giao diện đến dữ liệu): tạo bài `kiem-thu-luu-tin-tuc-20261117`, nhập tiêu đề, mô tả, nội dung, SEO và hai danh mục, bấm xuất bản thành công; mở lại màn sửa và trang người dùng xác nhận dữ liệu vẫn còn.
- Lượt đầu cố tình dùng chuỗi HTML thô trong ô soạn thảo để kiểm tra dữ liệu bất thường và phát hiện trang hiển thị cả thẻ `<p>`. Đã sửa lại bản ghi bằng thao tác nhập văn bản thuần như người dùng thật, lưu lại và kiểm tra ảnh hiển thị: thẻ HTML không còn lộ ra.

## 19. Nối Tổng quan quản trị vào dữ liệu thật — 17/11/2026

- Phát hiện màn Tổng quan quản trị đang hiển thị số 0 và trạng thái không có đơn hàng cố định, không phản ánh các bảng thật trong Supabase.
- Bổ sung hàm tổng hợp số lượng bản ghi từ `books`, `orders`, `creators` và `news_posts`, đồng thời lấy danh sách đơn hàng gần đây từ Supabase.
- Nối trực tiếp phiên bản `/admin` đang được sử dụng vào số liệu thật; không dùng số 0 hoặc danh sách mẫu làm dữ liệu thay thế khi truy vấn lỗi.
- Khi Supabase lỗi hoặc chưa có quyền, giao diện hiển thị thông báo lỗi rõ ràng thay vì báo số liệu giả.
- Kiểm tra sau thay đổi: `build`, `test:qa`, `verify:supabase-backend` và `git diff --check` đều đạt. Build còn cảnh báo kích thước gói runtime PDF/TTS lớn nhưng không lỗi.
- Kiểm tra trực tiếp qua trình duyệt đã đăng nhập bị công cụ điều khiển trình duyệt hết thời gian chờ ở lệnh lấy trạng thái; chưa dùng kết quả này để tuyên bố kiểm thử giao diện trực tiếp đã đạt.

## 20. Chặn đăng nhập/đăng ký giả khi thiếu Supabase — 17/11/2026

- Phát hiện luồng đăng nhập và đăng ký người dùng còn có nhánh dự phòng ghi thông tin vào `localStorage` (bộ nhớ tạm của trình duyệt) nếu Supabase chưa cấu hình.
- Đã bỏ hành vi dự phòng đó: thiếu Supabase hoặc đăng ký chưa tạo được phiên xác thực sẽ báo lỗi rõ ràng, không tự đánh dấu đăng nhập thành công và không sinh khách hàng/đơn hàng giả.
- `build`, `test:qa`, `verify:supabase-backend` và `git diff --check` đều đạt sau thay đổi.
