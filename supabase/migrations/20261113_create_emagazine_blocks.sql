alter table public.news_posts
  add column if not exists byline text;

create table if not exists public.news_post_blocks (
  id uuid primary key default gen_random_uuid(),
  news_post_id uuid not null references public.news_posts(id) on delete cascade,
  language text not null default 'vi' check (language in ('en', 'vi')),
  block_type text not null check (block_type in ('paragraph', 'heading', 'image', 'quote')),
  sort_order integer not null,
  content text not null default '',
  image_storage_path text,
  image_alt text,
  caption text,
  is_full_bleed boolean not null default false,
  image_width integer,
  image_height integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (news_post_id, language, sort_order)
);

create index if not exists news_post_blocks_listing_idx
  on public.news_post_blocks(news_post_id, language, sort_order);

alter table public.news_post_blocks enable row level security;
drop policy if exists "public reads published news blocks" on public.news_post_blocks;
create policy "public reads published news blocks"
  on public.news_post_blocks for select
  using (exists (
    select 1 from public.news_posts
    where news_posts.id = news_post_blocks.news_post_id
      and news_posts.status = 'active'
  ));

insert into public.news_posts (
  slug, content_type, status, published_at, image_storage_path,
  title_en, title_vi, kicker_en, kicker_vi, excerpt_en, excerpt_vi, byline,
  body_en, body_vi
)
values (
  'di-san-hue-doi-dien-nhieu-thach-thuc',
  'emagazine',
  'active',
  '2025-11-15T11:48:28+07:00',
  '/assets/emagazine/hue-heritage/01a13979-fa87-7422-8515-5d06644dd521.png',
  '(Emagazine) Bài 1: Di sản Huế đối diện nhiều thách thức',
  '(Emagazine) Bài 1: Di sản Huế đối diện nhiều thách thức',
  'Bảo vệ di sản Huế trước thiên tai',
  'Bảo vệ di sản Huế trước thiên tai',
  'VHO - TP. Huế hiện đang lưu giữ gần 1.000 di tích đã được công nhận, xếp hạng và kiểm kê, phản ánh sâu sắc những giai đoạn lịch sử quan trọng của vùng đất giàu truyền thống văn hóa.',
  'VHO - TP. Huế hiện đang lưu giữ gần 1.000 di tích đã được công nhận, xếp hạng và kiểm kê, phản ánh sâu sắc những giai đoạn lịch sử quan trọng của vùng đất giàu truyền thống văn hóa.',
  'SƠN THÙY; thiết kế: MẠNH LÊ',
  '[]'::jsonb,
  '[]'::jsonb
)
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
  byline = excluded.byline,
  updated_at = now();

with post as (
  select id from public.news_posts where slug = 'di-san-hue-doi-dien-nhieu-thach-thuc'
), blocks(language, block_type, sort_order, content, image_storage_path, image_alt, caption, is_full_bleed, image_width, image_height) as (
  values
    ('vi','image',0,'','/assets/emagazine/hue-heritage/01a13979-fa87-7422-8515-5d06644dd521.png','Di sản Huế trước thiên tai','',true,1900,1490),
    ('vi','paragraph',1,'Đợt mưa lũ lịch sử tại Huế từ cuối tháng 10 đến đầu tháng 11 vừa qua đã gây thiệt hại nặng nề ở nhiều lĩnh vực với tổng ước tính lên đến hơn 3.200 tỷ đồng. Riêng lĩnh vực di sản văn hóa đã bị tác động không nhỏ và còn tiềm ẩn nhiều nguy cơ nếu không kịp thời có các giải pháp ứng phó, bảo vệ kịp thời.','','','',false,null,null),
    ('vi','image',2,'','/assets/emagazine/hue-heritage/01a13979-fd16-75c6-9fc2-b00621745419.png','Lời cảnh báo từ bức tường thành','',false,1000,327),
    ('vi','paragraph',3,'Trung tâm Bảo tồn Di tích Cố đô Huế đang được giao nhiệm vụ quản lý và phát huy giá trị Quần thể Di tích Cố đô Huế đã được UNESCO vinh danh là di sản văn hóa thế giới từ năm 1993 cùng nhiều di tích liên quan đến triều Nguyễn.','','','',false,null,null),
    ('vi','paragraph',4,'Trải qua nhiều thời gian và tác động mạnh bởi thiên tai khắc nghiệt của khí hậu miền Trung Việt Nam, nhiều di tích Huế đã bị ảnh hưởng, xuống cấp, hư hại. Đặc biệt, hệ thống kiến trúc cung đình triều Nguyễn với dấu ấn chủ đạo là kiến trúc gỗ và sử dụng vật liệu, vôi vữa truyền thống nên sức “chịu đựng” cũng có giới hạn nhất định.','','','',false,null,null),
    ('vi','image',5,'','/assets/emagazine/hue-heritage/01a13979-72d7-705d-8274-b22e35c865e7.jpg','Đoạn tường Hoàng thành Huế bị đổ sập','Đoạn tường Hoàng thành Huế bị đổ sập tối ngày 2.11.2025',false,1920,1237),
    ('vi','paragraph',6,'Chập tối ngày 2.11, lực lượng ứng trực ở cổng Hòa Bình (phía đường Đặng Thái Thân) của Hoàng thành Huế bất ngờ phát hiện một đoạn tường dài gần 15m bị đổ sập xuống giữa cơn mưa nặng hạt.','','','',false,null,null),
    ('vi','paragraph',7,'Sự cố trong thiên tai là điều bất khả kháng nhưng nhiều người vẫn bày tỏ tiếc nuối khi đơn vị quản lý di tích không sớm cảnh báo, dự liệu nguy cơ này. Được biết, hệ thống tường Hoàng thành bắt đầu xây dựng từ thời vua Gia Long với mục đích là công trình bảo vệ cho hệ thống cung điện triều Nguyễn, các miếu thờ quan trọng và Tử Cấm thành.','','','',false,null,null),
    ('vi','paragraph',8,'Ông Hoàng Việt Trung, Giám đốc Trung tâm Bảo tồn Di tích Cố đô Huế cho biết: Ngay sau khi xảy ra vụ việc, Trung tâm đã cắt cử lực lượng rào chắn, cắm biển cảnh báo đảm bảo an toàn cho di tích và du khách. Đồng thời, tổ chức che chắn và triển khai các giải pháp cấp thiết để bảo vệ khu vực tường thành bị sập.','','','',false,null,null),
    ('vi','image',9,'','/assets/emagazine/hue-heritage/01a13979-fbbe-7d98-9e58-8eeed7459b3e.png','Lực lượng bảo vệ di tích','',false,1100,597),
    ('vi','paragraph',10,'Hiện Trung tâm cũng là rà soát tổng thể bốn mặt tường Hoàng với chiều dài khoảng 2.000m nhằm kiểm tra độ nghiêng, lún. Qua đó, đã phát hiện 6 điểm nguy hiểm, có nguy cơ xảy ra sự cố nếu “no nước” do mưa lớn kéo dài và ngập lụt.','','','',false,null,null),
    ('vi','paragraph',11,'Cùng với tường thành, nhiều điểm di tích khác ở khu di sản Huế cũng bị nước lũ tràn vào nguy cơ ảnh hưởng đến chất lượng và tuổi thọ công trình, đặc biệt là các công trình di tích kiến trúc gỗ truyền thống.','','','',false,null,null),
    ('vi','image',12,'','/assets/emagazine/hue-heritage/01a13979-7ab8-72a6-9f6e-f38a6f7aeb21.jpg','Trường Lang sau lũ','Sau khi nước lũ rút, các cột gỗ ở Trường Lang đối diện nguy cơ bị ảnh hưởng tuổi thọ và chất lượng công trình',false,1280,720),
    ('vi','paragraph',13,'Có thể kể đến như, di tích Trường Lang bị ngập nước sâu 0,5m; điện chính cung Diên Thọ bị nước lũ tràn vào; các nhà Tả Vu - Hữu Vu ở Đại Nội; điện Biểu Đức, nhà Tả - Hữu Tùng Tự ở lăng Thiệu Trị; dãy nhà ngang ở cung An Định…','','','',false,null,null),
    ('vi','image',14,'','/assets/emagazine/hue-heritage/01a13979-fdb1-7bfd-b274-d45db831ec43.png','Nhiều di tích quốc gia bị nước lũ bủa vây','',false,1000,272),
    ('vi','paragraph',15,'Hiện nay các điểm di tích về Chủ tịch Hồ Chí Minh đã mở cửa trở lại, song ít ai biết trong đợt mưa lũ vừa qua, hệ thống di tích về Người tại TP. Huế đã bị ảnh hưởng nghiêm trọng.','','','',false,null,null),
    ('vi','image',16,'','/assets/emagazine/hue-heritage/01a13979-7c4b-7a76-941f-a00c8a857d42.jpg','Nhà lưu niệm Bác Hồ sau lũ','Các lực lượng dọn vệ sinh sau lũ tại di tích quốc gia đặc biệt Nhà lưu niệm Bác Hồ ở làng Dương Nỗ',false,1280,901),
    ('vi','paragraph',17,'Bà Lê Thùy Chi, Giám đốc Bảo tàng Hồ Chí Minh tại Huế, cho biết: có 6/7 di tích lưu niệm do bảo tàng quản lý đều bị ngập nặng; trong đó có 3 di tích quốc gia đặc biệt, gồm: Nhà lưu niệm Bác Hồ tại làng Dương Nỗ, Nhà lưu niệm Bác Hồ tại đường Mai Thúc Loan bị ngập sâu với từ 1m đến 1,2m; đình làng Dương Nỗ bị ngập hơn 1,5m.','','','',false,null,null),
    ('vi','paragraph',18,'Dù hạn chế được thiệt hại về tài sản và hiện vật trưng bày, nhưng các công trình di tích bằng gỗ, tranh tre ngâm trong nước lũ dài ngày có nguy cơ ảnh hưởng đến tuổi thọ.','','','',false,null,null),
    ('vi','paragraph',19,'Hay di tích quốc gia Tháp Chăm Phú Diên bị ngập nước dài ngày, mực nước lúc cao điểm lên đến 1m. Công trình tháp Chăm hơn 1.200 năm tuổi bị nước bủa vây khiến nhiều người lo lắng di tích bị xuống cấp, hư hại, nhất là phần chân tháp.','','','',false,null,null),
    ('vi','image',20,'','/assets/emagazine/hue-heritage/01a13979-fd06-7879-a148-2c8e341cd30c.png','Tháp Chăm Phú Diên bị ngập nước','Di tích quốc gia Tháp Chăm Phú Diên bị ngập nước',true,1900,657),
    ('vi','paragraph',21,'Ngay sau khi ông Hoàng Hải Minh - Phó Chủ tịch UBND TP. Huế đến kiểm tra tình hình, đã yêu cầu các đơn vị liên quan tăng cường nhân lực giám sát và huy động nhiều máy bơm hút khô nước khu vực di tích để đảm bảo an toàn.','','','',false,null,null),
    ('vi','paragraph',22,'Theo Bảo tàng Lịch sử TP. Huế, ngoài di tích Tháp Chăm Phú Diên, nhiều di tích do đơn vị trực tiếp quản lý cũng bị tác động không nhỏ sau đợt thiên tai vừa qua. Có thể kể đến là di tích quốc gia Trụ sở Xứ ủy Trung Kỳ 1938-1939, Nhà lưu niệm đồng chí Nguyễn Chí Diểu, di tích cấp thành phố Trụ sở Tòa soạn báo Tiếng Dân, khu chứng tích Lao Thừa Phủ…','','','',false,null,null),
    ('vi','image',23,'','/assets/emagazine/hue-heritage/01a13979-6c42-7c1d-8b53-cf66ec7649f8.png','Những nguy cơ hiện hữu','',false,1000,282),
    ('vi','paragraph',24,'TS. Huỳnh Thị Anh Vân, nguyên Giám đốc Bảo tàng Cổ vật Cung đình Huế cho biết, những ghi chép sơ bộ từ sử liệu cho thấy thảm hoạ từ thiên nhiên đã để lại nhiều biến động lớn ở Huế như mở hoặc lấp cửa biển vào các năm 1403, 1467, 1497 -1504, 1627, 1629, 1811, 1897, 1904, 1999… cùng với thiệt hại lớn về con người, công trình, tài sản. Và đến nay vẫn tiếp tục gây tổn thất to lớn trong đời sống của con người, đặc biệt là với những tài sản, di sản văn hoá do tiền nhân để lại.','','','',false,null,null),
    ('vi','paragraph',25,'Ông Hoàng Việt Trung nói rằng: Trung tâm Bảo tồn Di tích Cố đô Huế hiện được giao quản lý 43 điểm di tích, trải dài từ khu vực trung tâm thành phố cho đến các vùng ven, xa nhất là di tích Hải Vân Quan giáp với TP. Đà Nẵng.','','','',false,null,null),
    ('vi','paragraph',26,'Những công trình di tích thường xuyên đối diện với thời tiết khắc nghiệt, mùa hè nắng gắt, mùa mưa thì độ ẩm cao, mưa lớn, bão lũ… Tường Hoàng thành cũng đã 200 năm, trải qua nhiều biến cố cùng với các tác động của thiên tai nên bị xói lở, thoái hóa và đến “thời hạn”.','','','',false,null,null),
    ('vi','paragraph',27,'Theo TS. Huỳnh Thị Anh Vân, các công trình kiến trúc lịch sử ở Huế vốn được làm bằng các loại vật liệu truyền thống như gỗ, vôi vữa nên dễ bị hư hại ở nhiều mức độ khác nhau… Sự tổn hại có thể nhận biết ngay bằng mắt thường do công trình bị gãy đổ, sạt lở, lún sụt, nhưng cũng có những tổn hại diễn ra âm thầm trong kết cấu của công trình.','','','',false,null,null),
    ('vi','paragraph',28,'Độ ẩm trong không khí dễ dẫn đến hiện tượng gạch mủn, xảy ra ở hầu hết các công trình cổ, đặc biệt là các di tích Champa. Các công trình kiến trúc gỗ càng chịu tác động của thời tiết và côn trùng (mối, mọt); công trình có sơn son thếp vàng bị tác động nhiều bởi bức xạ mặt trời…','','','',false,null,null),
    ('vi','image',29,'','/assets/emagazine/hue-heritage/01a13979-8233-759d-a509-3c06e6e07a19.jpg','Đá phía triền núi có nguy cơ sạt trượt','Những tảng đá phía triền núi ở khu vực di tích điện Huệ Nam có nguy cơ sạt trượt đe dọa đến an toàn di tích',false,925,925),
    ('vi','paragraph',30,'Nhiều năm qua, di tích điện Huệ Nam (hay điện Hòn Chén) cũng đối diện với nguy cơ sạt lở bờ sông và lở núi, đá lăn từ phía núi Ngọc Trản. Năm 2023, chính quyền địa phương đã phải công bố tình trạng thiên tai khẩn cấp ở di tích điện Huệ Nam để khẩn trương khắc phục.','','','',false,null,null),
    ('vi','paragraph',31,'Nguy cơ trượt lở núi ở đây đã được cảnh báo từ lâu, đã từng có nhiều chuyên gia trong và ngoài nước đến khảo sát, đánh giá nhưng vẫn chưa có phương án xử lý khả thi. Hiện tại, Trung tâm Bảo tồn Di tích Cố đô Huế triển khai giải pháp gia cố, giằng néo, sử dụng cáp thép làm lưới để giữ cố định cây xanh và các tảng đá lớn khu vực triền núi để đảm bảo an toàn.','','','',false,null,null),
    ('vi','image',32,'','/assets/emagazine/hue-heritage/01a13979-707c-7792-845d-512be9fea7ab.jpg','Kinh thành Huế trong đợt mưa lũ lịch sử','Kinh thành Huế trong đợt mưa lũ lịch sử cuối tháng 10.2025 vừa qua',true,2048,1458)
)
insert into public.news_post_blocks (news_post_id, language, block_type, sort_order, content, image_storage_path, image_alt, caption, is_full_bleed, image_width, image_height)
select post.id, blocks.language, blocks.block_type, blocks.sort_order, blocks.content, blocks.image_storage_path, blocks.image_alt, blocks.caption, blocks.is_full_bleed, blocks.image_width, blocks.image_height
from post cross join blocks
on conflict (news_post_id, language, sort_order) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  image_storage_path = excluded.image_storage_path,
  image_alt = excluded.image_alt,
  caption = excluded.caption,
  is_full_bleed = excluded.is_full_bleed,
  image_width = excluded.image_width,
  image_height = excluded.image_height,
  updated_at = now();

