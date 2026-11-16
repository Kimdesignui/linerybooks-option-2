begin;

-- The storefront is deployed at linerybookstore2.pages.dev. These assets are
-- shipped with that frontend, so Supabase stores their metadata and publication
-- state without introducing a second image host.
with hosted_assets(storage_path, public_url, file_name, mime_type, asset_type, alt_text) as (
  values
    ('/assets/hero-children.png', '/assets/hero-children.png', 'hero-children.png', 'image/png', 'banner', 'LineryBooks hero banner'),
    ('/assets/hero-children-shop-hover.png', '/assets/hero-children-shop-hover.png', 'hero-children-shop-hover.png', 'image/png', 'banner', 'LineryBooks hero banner hover'),
    ('/assets/linerybooks-logo-pixel-bg.svg', '/assets/linerybooks-logo-pixel-bg.svg', 'linerybooks-logo-pixel-bg.svg', 'image/svg+xml', 'logo', 'LineryBooks logo'),
    ('/assets/linerybooks-favicon-round.svg', '/assets/linerybooks-favicon-round.svg', 'linerybooks-favicon-round.svg', 'image/svg+xml', 'favicon', 'LineryBooks favicon')
), upserted as (
  insert into public.site_media_assets (storage_path, public_url, file_name, mime_type, asset_type, alt_text, is_active)
  select storage_path, public_url, file_name, mime_type, asset_type, alt_text, true
  from hosted_assets
  on conflict (storage_path) do update set
    public_url = excluded.public_url,
    file_name = excluded.file_name,
    mime_type = excluded.mime_type,
    asset_type = excluded.asset_type,
    alt_text = excluded.alt_text,
    is_active = true
  returning id, storage_path
)
insert into public.site_banners (name, position_code, media_asset_id, sort_order, display_mode, status)
select
  case when upserted.storage_path like '%shop-hover%' then 'Hero LineryBooks 02' else 'Hero LineryBooks 01' end,
  'HOME_HERO',
  upserted.id,
  case when upserted.storage_path like '%shop-hover%' then 2 else 1 end,
  'desktop-mobile',
  'published'
from upserted
where upserted.storage_path like '%hero-children%'
  and not exists (
    select 1
    from public.site_banners existing
    where existing.position_code = 'HOME_HERO'
      and existing.sort_order = case when upserted.storage_path like '%shop-hover%' then 2 else 1 end
  );

insert into public.site_settings (setting_key, language, value_json, is_public)
values
  ('site_name', 'all', '{"value":"LineryBooks"}'::jsonb, true),
  ('site_logo', 'all', '{"storagePath":"/assets/linerybooks-logo-pixel-bg.svg","publicUrl":"/assets/linerybooks-logo-pixel-bg.svg"}'::jsonb, true),
  ('site_favicon', 'all', '{"storagePath":"/assets/linerybooks-favicon-round.svg","publicUrl":"/assets/linerybooks-favicon-round.svg"}'::jsonb, true)
on conflict (setting_key, language) do update set
  value_json = excluded.value_json,
  is_public = excluded.is_public,
  updated_at = now();

commit;
