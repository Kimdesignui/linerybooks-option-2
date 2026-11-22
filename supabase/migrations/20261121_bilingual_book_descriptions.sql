alter table public.books
  add column if not exists description_html_vi text;

comment on column public.books.description_html is 'English book description and details shown when the storefront language is English.';
comment on column public.books.description_html_vi is 'Vietnamese book description and details shown when the storefront language is Vietnamese.';
