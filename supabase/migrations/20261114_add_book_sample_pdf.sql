begin;

alter table public.books
  add column if not exists sample_pdf_storage_path text,
  add column if not exists sample_pdf_page_count integer,
  add column if not exists sample_pdf_enabled boolean not null default false;

alter table public.books
  drop constraint if exists books_sample_pdf_page_count_check;

alter table public.books
  add constraint books_sample_pdf_page_count_check
  check (sample_pdf_page_count is null or sample_pdf_page_count > 0);

create index if not exists books_sample_pdf_idx
  on public.books(sample_pdf_enabled, status, is_visible_website)
  where sample_pdf_storage_path is not null;

insert into storage.buckets (id, name, public)
values ('book-samples', 'book-samples', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can read book samples" on storage.objects;
create policy "public can read book samples"
  on storage.objects for select
  using (bucket_id = 'book-samples');

drop policy if exists "authenticated can upload book samples" on storage.objects;
create policy "authenticated can upload book samples"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'book-samples');

commit;
