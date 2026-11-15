alter table public.creators
  add column if not exists academic_title text;

comment on column public.creators.awards is 'One award per line or semicolon-delimited; rendered as a list on the public creator profile.';
comment on column public.creators.academic_title is 'One academic title per line or semicolon-delimited; rendered as a list on the public creator profile.';
