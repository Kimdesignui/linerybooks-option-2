# Linery Book — biên bản rà soát bàn giao

Ngày kiểm tra: 2026-11-19 (Asia/Saigon)  
Phạm vi chính: `https://linerybook.com/` và đối chiếu công khai với `https://tiemsachquyt.com/`.  
**Không đưa `linerybooks.vn` vào phạm vi kết luận.**

## Kết luận nhanh

- `linerybook.com` hiện có website và đang hiển thị thương hiệu **Linery Bookstore**, địa chỉ `Hanoi`, email `contact@linerybook.com`, các nhóm sách Fiction/Non-fiction/Best-sellers/Linery Publishing.
- Có dấu hiệu **tái sử dụng cấu trúc giao diện/danh mục** từ Tiệm sách Quýt: thứ tự và tên nhiều nhóm danh mục trùng nhau, gồm Fiction, Non-fiction, Best-sellers, cùng các nhánh Ancient Greek & Roman…, African-American Literature, British Literature, Asian Literature, European Literature, Russian Classics, Poetry, NYRB, Everyman's Library, Latin-America Literature, Essay & Literary Criticism, Writing Guides, Philosophy, Social Study, Music, Memoir.
- Tuy nhiên, bằng chứng công khai hiện có **chưa đủ để kết luận** `linerybook.com` còn hiển thị thông tin giới thiệu, email chuyển tiếp hoặc thông tin thanh toán của Tiệm sách Quýt. Cần kiểm tra mã nguồn/hosting/email/payment của đúng website.
- Các trang sản phẩm công khai của Linery Book có nội dung mô tả tiếng Anh, giá VND, footer `contact@linerybook.com`; chưa thấy chuỗi `tiemsachquyt` trong kết quả tìm kiếm công khai.

## Danh sách lỗi cần đánh dấu

| ID | Mức độ | Hạng mục | Bằng chứng | Trạng thái |
|---|---|---|---|---|
| LBOOK-001 | HIGH | Khả năng clone cấu trúc danh mục từ Tiệm sách Quýt | Hai website có cùng hệ danh mục và thứ tự điều hướng ở nhiều nhóm; đây là dấu hiệu cần truy nguyên nguồn, chưa phải kết luận pháp lý | OPEN — yêu cầu bên bàn giao giải trình nguồn template/dữ liệu |
| LBOOK-002 | HIGH | Cần kiểm tra thông tin giới thiệu có còn thuộc Tiệm sách Quýt | Linery Book hiện chỉ hiển thị mô tả ngắn `Independent books`, địa chỉ `Hanoi`; chưa có trang giới thiệu rõ ràng trong nội dung đã lập chỉ mục | OPEN — kiểm tra toàn bộ trang, footer, metadata, CMS và file tĩnh |
| LBOOK-003 | HIGH | Email/forwarding có thể còn trỏ về bên cũ | Website công khai hiển thị `contact@linerybook.com`; không thể suy ra forwarding từ HTML | OPEN — kiểm tra MX, SPF, DKIM, DMARC, aliases, forwarding rules, filters và SMTP ở nhà cung cấp email |
| LBOOK-004 | CRITICAL | Thông tin thanh toán có thể lẫn của Tiệm sách Quýt | Chưa tìm thấy payment page ổn định qua công cụ web; checkout/cart timeout hoặc 502 ở lần kiểm tra | OPEN — không xác nhận thanh toán thật cho tới khi đối chiếu tài khoản ngân hàng, QR, chủ tài khoản, webhook và provider |
| LBOOK-005 | HIGH | Nội dung sản phẩm cần kiểm tra bản quyền/nguồn nhập | Linery Book đang hiển thị nhiều sách và mô tả tiếng Anh; cần đối chiếu từng sản phẩm với dữ liệu được bàn giao, không chỉ đổi logo/tên miền | OPEN — lập bảng đối chiếu SKU/tên/tác giả/giá/ảnh/mô tả/nguồn |
| LBOOK-006 | MEDIUM | Thông tin doanh nghiệp chưa đầy đủ | Footer công khai chỉ ghi `Địa chỉ: Hanoi`, `Email: contact@linerybook.com`; chưa thấy pháp nhân, mã số thuế, hotline, chính sách và thông tin thanh toán rõ ràng | OPEN — xác nhận thông tin pháp lý và chính sách trước khi bán |

## Bằng chứng đối chiếu công khai

### Linery Book

- Trang chủ: `https://linerybook.com/`
- Footer: `Địa chỉ: Hanoi`, `Email: contact@linerybook.com`.
- Trang sản phẩm đã kiểm tra: `https://linerybook.com/the-hound-of-the-baskervilles-a-study-in-scarlet-the-sign-of-four`.
- Trang sản phẩm hiển thị tác giả Arthur Conan Doyle, tình trạng New, giá `530.000₫`, nút thêm giỏ/mua ngay và cùng email `contact@linerybook.com`.

### Tiệm sách Quýt

- Trang chủ: `https://tiemsachquyt.com/`
- Footer: `Tiệm sách Quýt`, email `tiemsachquyt@gmail.com`, thành phố Hồ Chí Minh, Sapo.
- Các nhóm danh mục và nhiều nhánh con trùng với Linery Book như đã nêu ở trên.

## Việc cần làm tiếp theo

1. Lấy bản sao đầy đủ website đúng `linerybook.com`: mã nguồn, cơ sở dữ liệu, uploads/media, file cấu hình, bản build và lịch sử triển khai.
2. Tìm chính xác các chuỗi: `tiemsachquyt`, `tiemsachquyt.com`, `tiemsachquyt@gmail.com`, địa chỉ/số điện thoại/tài khoản ngân hàng của bên cũ.
3. Kiểm tra DNS và email: MX, forwarding, alias, filter, SMTP/API key, OAuth session; xoay khóa nếu phát hiện tài khoản cũ.
4. Kiểm tra payment: tên ngân hàng, số tài khoản, chủ tài khoản, QR, mã đơn, callback/webhook, tài khoản nhận tiền và lịch sử sửa gần nhất.
5. Lập bảng đối chiếu từng sản phẩm và từng trang chính sách; đánh dấu `Đúng Linery`, `Của Tiệm sách Quýt`, `Demo`, `Chưa xác minh`.
6. Tạm ngừng quảng bá/nhận chuyển khoản nếu chưa xác minh payment và email forwarding.

## Giới hạn

Đợt này chỉ đọc nội dung công khai và không đăng nhập, không gửi form, không tạo đơn, không chuyển khoản, không truy cập tài khoản DNS/email/payment. Vì vậy chưa thể kết luận về forwarding email hoặc tài khoản nhận tiền chỉ từ website công khai.
