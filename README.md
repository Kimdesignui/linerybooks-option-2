# LineryBooks Tailwind frontend

Giao diện được dựng từ frame Figma `linerybooks.vn` bằng React + TypeScript + Vite + Tailwind CSS v4.

## Bắt đầu trên máy mới

```powershell
git clone https://github.com/Kimdesignui/linerybooks-option-2.git
cd linerybooks-option-2
npm install
npm run dev:enhanced
```

Mở `http://127.0.0.1:5174/` trong trình duyệt. Package phonemizer của TTS đã được vendored tại `vendor/`, nên không cần có thư mục `../nghitts-src` trên máy mới.

Nếu máy đã clone repo trước đó:

```powershell
git pull origin main
npm install
npm run dev:enhanced
```

## Chạy local

```powershell
npm install
npm run dev
```

Sau đó mở đúng địa chỉ server:

```text
http://127.0.0.1:5174/
```

Không mở trực tiếp `index.html` bằng double-click hoặc URL bắt đầu bằng `file:///`. `index.html` là entry của Vite và cần server để biên dịch `src/main.tsx` và nạp Tailwind.

Để xem bản build gần giống một website HTML tĩnh:

```powershell
npm run build
npm run preview
```

Mở địa chỉ mà Vite in ra, thường là `http://127.0.0.1:4173/`.

## Ghi chú bàn giao

- Biến môi trường Supabase dùng `.env.enhanced` theo cấu hình local hiện có; khi chuyển máy, tạo file này từ `.env.test.example` và điền URL/publishable key của project Supabase tương ứng.
- Migration và seed dữ liệu nằm trong `supabase/migrations/`; chạy theo thứ tự timestamp bằng Supabase SQL Editor hoặc Supabase CLI đã đăng nhập.
- File PDF đọc thử demo nằm tại `public/assets/book-samples/a-manual-for-cleaning-women.pdf`.
- Asset tĩnh nằm trong `public/assets/`.
- Responsive đã định nghĩa cho desktop, tablet và mobile theo các frame 1920/768/390 trong Figma.

## Các route hiện có

- `/` hoặc `/#home`: trang chủ, hero, các carousel sách và footer.
- `/all-books`: trang tất cả sách.
- `/authors`: danh mục Authors.
- Chi tiết sách hiện mở bằng nút `Read more`/click vào thẻ sách trong app; đây là state nội bộ của React.

## Những phần đã hoàn thiện

- Header sticky, menu Shop desktop và sidebar hamburger mobile.
- Sidebar mobile có glassmorphism nền olive, nút đóng và đóng khi bấm ra ngoài.
- Menu Shop desktop xổ xuống có animation và bo hai góc dưới.
- Carousel sách theo từng slide, pagination circle và chuyển động mượt.
- Book card có hover overlay, CTA `Read more`/`Add to basket`, quick preview bên phải.
- Trang chi tiết sách có gallery/lightbox, Format, Category, Description, Reviews và Details.
- Cột thông tin trang chi tiết dùng sticky ở desktop/tablet lớn. Scrollbar nội bộ rộng 2px, có track/thumb và cho phép cuộn tiếp xuống section bên dưới khi chạm đáy.
- Tên sách chi tiết vẫn dùng thẻ `h1`, cỡ hiện tại tối đa 54px desktop, 34px tablet và 32px mobile.
- Footer có social links Instagram, Facebook, TikTok và Threads.

## File cần xem khi tiếp tục phát triển

  - `src/App.tsx`: component, điều hướng, reader và interaction.
- `src/styles.css`: toàn bộ CSS responsive, ribbon, menu, card, detail page và footer.
- `src/main.tsx`: entry point React.
- `public/assets/`: ảnh hero, footer, bìa sách và SVG ribbon.
- `netlify.toml`: cấu hình build Netlify.

## Kiểm tra trước khi bàn giao

```powershell
npm run build
```

Nếu build pass, chạy bản preview:

```powershell
npm run preview
```

Kiểm tra tối thiểu ở desktop, tablet và mobile: menu Shop, hamburger sidebar, tìm kiếm, carousel, click mở chi tiết sách, lightbox, scrollbar cột thông tin và footer.

## Repository hiện tại

- GitHub: https://github.com/Kimdesignui/linerybooks-option-2
- Nhánh chính: `main`
- Đây là project độc lập, không dùng chung remote hoặc lịch sử Git với project cũ.

Quy trình đề xuất:

```powershell
git pull origin main
# chỉnh sửa code
npm run build
git add .
git commit -m "Describe the change"
git push origin main
```

Sau khi push, chờ Netlify build xong rồi kiểm tra lại URL public. Không commit `node_modules/`, file `.env` hoặc thông tin đăng nhập.
