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

## Tài sản đã bàn giao

- PDF đọc thử: `public/assets/book-samples/a-manual-for-cleaning-women.pdf`
- Package TTS: `vendor/phonemizer-1.2.2.tgz`
- Từ điển TTS: `public/acronyms.csv`, `public/non-vietnamese-words.csv`
- Migration: `supabase/migrations/`

Không commit `.secrets/`, `node_modules/`, `dist/`, output QA hoặc file môi trường chứa thông tin riêng.
