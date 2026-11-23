-- Restore the editorial demo set used by the admin News workflow.
-- This migration is intentionally idempotent so it can be applied after the
-- existing eMagazine migration without creating duplicate slugs.
insert into public.news_posts (
  slug, content_type, status, published_at, image_storage_path,
  title_en, title_vi, kicker_en, kicker_vi, excerpt_en, excerpt_vi,
  body_en, body_vi, byline
)
select slug, content_type::text, 'active', published_at::timestamptz, image_storage_path,
  title_en, title_vi, kicker_en, kicker_vi, excerpt_en, excerpt_vi,
  body_en::jsonb, body_vi::jsonb, byline
from (values
  ('women-read-about-women', 'news', '2025-10-12T09:00:00+07:00', '/assets/news-instagram-01.jpg', 'Women read about women', 'Phụ nữ đọc về phụ nữ', 'Book notes', 'Book notes', 'A reading list about women, independence, identity, and the many ways literature helps us see ourselves.', 'Một danh sách đọc về phụ nữ, sự độc lập, bản sắc và cách văn chương giúp chúng ta nhìn lại chính mình.', '["There is something fascinating about reading books written about women: the more we read, the more we begin to notice the beliefs and conventions that have shaped everyday life.","These books open new ways of seeing the world. They make space for each reader to find her own answers, on her own terms."]', '["Có điều gì đó thật đặc biệt khi đọc những cuốn sách viết về phụ nữ: càng đọc, ta càng nhận ra những niềm tin và quy ước đã định hình đời sống thường ngày.","Những cuốn sách này mở ra nhiều cách nhìn mới về thế giới và tạo không gian để mỗi độc giả tự tìm câu trả lời cho mình."]', ''),
  ('toni-morrison-memory-and-the-past', 'news', '2025-09-25T09:00:00+07:00', '/assets/news-instagram-02.jpg', 'Toni Morrison: memory and the past', 'Toni Morrison: ký ức và quá khứ', 'Book notes', 'Book notes', 'Toni Morrison writes about memory as something that stays with the body, the home, and the people we become.', 'Toni Morrison viết về ký ức như một điều ở lại trong cơ thể, mái nhà và con người mà chúng ta trở thành.', '["In Morrison’s books, the past is never truly still. It returns through a house, a scar, a touch, a fear, or an apparently ordinary act of love.","Her characters carry loss, violence, survival, and the long work of learning how to belong to themselves."]', '["Trong sách của Morrison, quá khứ chưa bao giờ thực sự đứng yên. Nó trở lại qua một ngôi nhà, vết sẹo, cái chạm, nỗi sợ hoặc một hành động yêu thương tưởng như bình thường.","Các nhân vật của bà mang theo mất mát, bạo lực, sự sinh tồn và hành trình dài để học cách thuộc về chính mình."]', ''),
  ('the-temple-of-golden-pavilion', 'news', '2025-08-20T09:00:00+07:00', '/assets/news-instagram-03.jpg', 'The Temple of Golden Pavilion', 'Kim Các Tự', 'From the shelf', 'From the shelf', 'Yukio Mishima’s novel follows a young man whose ideal of beauty becomes impossible to live with.', 'Cuốn tiểu thuyết của Yukio Mishima kể về một chàng trai không thể sống yên với lý tưởng về cái đẹp của mình.', '["Mizoguchi grows up loving the Golden Pavilion through his father’s stories before he has ever seen it.","Mishima turns a historical event into a study of beauty, obsession, and the distance between an ideal and the world that surrounds it."]', '["Mizoguchi lớn lên với tình yêu dành cho Kim Các Tự qua những câu chuyện của cha trước cả khi được nhìn thấy ngôi chùa.","Mishima biến một sự kiện lịch sử thành câu chuyện về cái đẹp, sự ám ảnh và khoảng cách giữa lý tưởng với thế giới xung quanh."]', ''),
  ('the-sound-of-waves', 'news', '2025-07-18T09:00:00+07:00', '/assets/news-instagram-04.jpg', 'The Sound of Waves', 'Âm thanh của sóng', 'From the shelf', 'From the shelf', 'A quiet island love story, told with the tenderness and rhythm of the sea.', 'Một câu chuyện tình lặng lẽ trên đảo, được kể bằng sự dịu dàng và nhịp điệu của biển.', '["Set on the secluded island of Utajima, the novel follows Shinji and Hatsue as their love unfolds among fishing boats, sea winds, and the rhythm of the waves.","Nature is never merely a backdrop. The island’s isolation gives small gestures meaning and reveals a gentler side of Mishima’s writing."]', '["Lấy bối cảnh hòn đảo biệt lập Utajima, tiểu thuyết theo chân Shinji và Hatsue khi tình yêu của họ nảy nở giữa thuyền đánh cá, gió biển và nhịp sóng bất tận.","Thiên nhiên không chỉ là phông nền. Sự biệt lập của hòn đảo khiến những cử chỉ nhỏ trở nên có ý nghĩa và cho thấy một mặt dịu dàng hơn trong văn chương Mishima."]', ''),
  ('gioi-thieu', 'news', '2025-06-12T09:00:00+07:00', '/assets/news-instagram-01.jpg', 'About LineryBooks', 'Giới thiệu LineryBooks', 'About us', 'About us', 'LineryBooks is a curated bookstore and independent press built in Hanoi.', 'LineryBooks là hiệu sách tuyển chọn và independent press được xây dựng tại Hà Nội.', '["LineryBooks selects books with lasting reading value and creates space for literature, ideas, and independent voices."]', '["LineryBooks tuyển chọn những cuốn sách có giá trị đọc lâu dài, đồng thời tạo không gian cho các tiếng nói văn chương và ý tưởng độc lập."]', ''),
  ('lien-he', 'news', '2025-05-12T09:00:00+07:00', '/assets/news-instagram-02.jpg', 'Contact LineryBooks', 'Liên hệ LineryBooks', 'About us', 'About us', 'Contact information, address, and ways to connect with LineryBooks.', 'Thông tin liên hệ, địa chỉ và các kênh kết nối với LineryBooks.', '["You can reach LineryBooks at info@linerybooks.vn or visit Hanoi Book Street, Cua Nam Ward, Hanoi."]', '["Bạn có thể liên hệ LineryBooks qua email info@linerybooks.vn hoặc ghé Phố Sách Hà Nội, phường Cửa Nam, Hà Nội."]', ''),
  ('chinh-sach', 'news', '2025-04-12T09:00:00+07:00', '/assets/news-instagram-03.jpg', 'LineryBooks policies', 'Chính sách LineryBooks', 'Policies', 'Policies', 'The purchase, delivery, returns, and privacy policies of LineryBooks.', 'Các chính sách mua hàng, giao hàng, đổi trả và bảo mật của LineryBooks.', '["The main policy content will be maintained from the administration area and displayed consistently across the website."]', '["Nội dung chính sách sẽ được cập nhật từ khu vực quản trị và hiển thị thống nhất trên website."]', ''),
  ('dieu-khoan', 'news', '2025-03-12T09:00:00+07:00', '/assets/news-instagram-04.jpg', 'Terms of use', 'Điều khoản sử dụng', 'Policies', 'Policies', 'The terms for using the LineryBooks website and services.', 'Điều khoản sử dụng website và các dịch vụ của LineryBooks.', '["These terms will be maintained from the administration area and shown consistently wherever customers need them."]', '["Nội dung điều khoản sẽ được cập nhật từ khu vực quản trị và hiển thị thống nhất trên website."]', '')
) as seed(slug, content_type, published_at, image_storage_path, title_en, title_vi, kicker_en, kicker_vi, excerpt_en, excerpt_vi, body_en, body_vi, byline)
on conflict (slug) do update set
  content_type = excluded.content_type,
  status = excluded.status,
  published_at = excluded.published_at,
  image_storage_path = excluded.image_storage_path,
  title_en = excluded.title_en,
  title_vi = excluded.title_vi,
  kicker_en = excluded.kicker_en,
  kicker_vi = excluded.kicker_vi,
  excerpt_en = excluded.excerpt_en,
  excerpt_vi = excluded.excerpt_vi,
  body_en = excluded.body_en,
  body_vi = excluded.body_vi,
  byline = excluded.byline,
  updated_at = now();

-- Keep footer assignments data-driven: the existing Website & footer admin
-- screen can point to these stable article slugs without hardcoded content.
