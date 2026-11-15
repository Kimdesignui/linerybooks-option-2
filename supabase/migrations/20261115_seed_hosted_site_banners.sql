begin;

-- These assets are shipped by the same Cloudflare-hosted frontend. Keeping
-- their metadata in Supabase lets the banner manager and storefront use one
-- source of truth without depending on an external image host.
with hosted_assets(storage_path, public_url, file_name, mime_type, asset_type, alt_text) as (
  values
    ('/assets/hero-children.png', '/assets/hero-children.png', 'hero-children.png', 'image/png', 'banner', 'LineryBooks hero banner'),
    ('/assets/hero-children-shop-hover.png', '/assets/hero-children-shop-hover.png', 'hero-children-shop-hover.png', 'image/png', 'banner', 'LineryBooks hero banner hover')
), inserted as (
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
  case when inserted.sort_order = 1 then 'Hero LineryBooks 01' else 'Hero LineryBooks 02' end,
  'HOME_HERO',
  inserted.id,
  inserted.sort_order,
  'desktop-mobile',
  'published'
from (
  select inserted.id, case when inserted.storage_path like '%shop-hover%' then 2 else 1 end as sort_order
  from inserted
) inserted
where not exists (
  select 1 from public.site_banners existing
  where existing.position_code = 'HOME_HERO'
    and existing.sort_order = inserted.sort_order
);

commit;
