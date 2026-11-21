-- Keep public article pages crawlable while allowing editors to remove them
-- from the News index and homepage listings. Footer links remain valid.
alter table public.news_posts
  add column if not exists show_on_news_listing boolean not null default true;

create index if not exists news_posts_public_news_listing_idx
  on public.news_posts(show_on_news_listing, published_at desc nulls last);
