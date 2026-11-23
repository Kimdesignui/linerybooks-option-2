# LineryBooks handoff

## Chạy trên máy mới

```powershell
git clone https://github.com/Kimdesignui/linerybooks-option-2.git
cd linerybooks-option-2
Copy-Item .env.test.example .env.enhanced
# điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY/publishable key
npm install
npm run dev:enhanced
```

Mở `http://127.0.0.1:5174/`.

## Supabase

Các thay đổi schema và dữ liệu seed được version-control trong `supabase/migrations/`. Chạy các file SQL theo thứ tự tên trong Supabase SQL Editor hoặc bằng Supabase CLI đã xác thực. Frontend không chứa service-role key và không có quyền tự chạy DDL.

## SEO cho từng sách và bài viết

Cloudflare Pages cần có hai biến môi trường runtime (biến chạy ở lớp máy chủ/edge, không chỉ biến dùng lúc build):

- `SUPABASE_URL` = URL Supabase
- `SUPABASE_ANON_KEY` = publishable/anon key của Supabase

Có thể dùng tên `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` thay thế nếu đó là tên biến đang được cấu hình trên Pages. Function `functions/[[path]].ts` dùng các biến này để lấy bản ghi sách/bài viết và chèn title, description, canonical, Open Graph, Twitter Card và JSON-LD vào HTML trước khi trả về trình duyệt.

Nếu chỉ cấu hình biến ở bước build mà không cấu hình runtime, giao diện vẫn cập nhật metadata sau khi JavaScript chạy, nhưng bot tìm kiếm có thể nhận HTML mặc định cho URL động. Sau khi cấu hình Pages, kiểm tra trực tiếp một URL dạng `/books/<slug>` và `/news/<slug>` để chắc chắn HTML ban đầu đã có canonical và JSON-LD riêng.

## Tài sản đã bàn giao

- PDF đọc thử: `public/assets/book-samples/a-manual-for-cleaning-women.pdf`
- Package TTS: `vendor/phonemizer-1.2.2.tgz`
- Từ điển TTS: `public/acronyms.csv`, `public/non-vietnamese-words.csv`
- Migration: `supabase/migrations/`

Không commit `.secrets/`, `node_modules/`, `dist/`, output QA hoặc file môi trường chứa thông tin riêng.
