# eMagazine: Di sản Huế đối diện nhiều thách thức

## Nguồn đã đối chiếu

- File gốc: `(Emagazine) Bài 1_ Di sản Huế đối diện nhiều thách thức.html`
- Ngày bài: `15/11/2025 · 11:48`
- Kicker: `Bảo vệ di sản Huế trước thiên tai`
- Byline: `SƠN THÙY; thiết kế: MẠNH LÊ`
- Hình ảnh: 11 tệp gốc, giữ nguyên kích thước và tỉ lệ ảnh.

## Layout đã chuyển thành dữ liệu

Trang không còn dùng hero/đoạn văn demo. Bài được tách thành các block theo đúng thứ tự trong HTML nguồn:

1. Thanh đen eMagazine riêng, không dùng header/footer của storefront.
2. Phần mở đầu căn giữa: kicker, tiêu đề, sapo và byline.
3. 33 block nội dung gồm paragraph và image; ảnh full-bleed được đánh dấu riêng.
4. Ảnh có `image_width`, `image_height`, `caption`, `alt` và `is_full_bleed` trong SQL.
5. Frontend chỉ dùng `width: 100%; height: auto`, vì vậy ảnh không bị crop hoặc méo tỉ lệ khi responsive.

## Mô hình dữ liệu Supabase

- `news_posts`: metadata và trạng thái xuất bản của bài.
- `news_post_blocks`: từng block longform, ngôn ngữ, thứ tự, nội dung, ảnh, caption và kích thước.
- Migration/seed: `supabase/migrations/20261113_create_emagazine_blocks.sql`.

Ảnh được copy vào `public/assets/emagazine/hue-heritage/`, nên khi build static site chúng được host cùng website. SQL lưu đường dẫn host nội bộ `/assets/...`, không phụ thuộc URL ảnh của báo khác.

## Responsive

- Desktop: đoạn đọc giữ cột hẹp, ảnh thường nằm trong cột nội dung; ảnh full-bleed bung toàn chiều rộng viewport.
- Mobile: đoạn đọc giảm gutter, ảnh vẫn tự giữ aspect ratio; không dùng chiều cao cố định và không tạo horizontal overflow.
