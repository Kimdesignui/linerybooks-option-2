type SitemapEnv = Record<string, unknown>
type SitemapRow = { slug?: string; published_at?: string; updated_at?: string }

const staticPaths = [
  '/',
  '/all-books',
  '/authors',
  '/news',
  '/gioi-thieu',
  '/lien-he',
  '/news/chinh-sach',
  '/news/dieu-khoan',
  '/collections/new-upcoming',
  '/collections/linery-press',
  '/collections/linery-picks',
  '/collections/linery-art-books',
  '/collections/grab-save',
]

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const validDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}
const directNewsPath = (slug: string) => slug === 'gioi-thieu' || slug === 'lien-he' ? `/${slug}` : `/news/${slug}`

const loadRows = async (baseUrl: string, apiKey: string, resource: string, query: string): Promise<SitemapRow[]> => {
  try {
    const response = await fetch(`${baseUrl}/rest/v1/${resource}?${query}`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) return []
    const data = await response.json() as unknown
    return Array.isArray(data) ? data as SitemapRow[] : []
  } catch {
    return []
  }
}

export async function onRequestGet({ request, env }: { request: Request; env: SitemapEnv }) {
  const origin = new URL(request.url).origin
  const paths = new Map<string, string>()
  for (const path of staticPaths) paths.set(path, '')
  const baseUrl = String(env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
  const apiKey = String(env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? '')
  if (baseUrl && apiKey) {
    const [news, books, creators] = await Promise.all([
      loadRows(baseUrl, apiKey, 'news_posts', 'select=slug,published_at,updated_at&status=eq.active&order=published_at.desc'),
      loadRows(baseUrl, apiKey, 'books', 'select=slug,updated_at&status=eq.active&is_visible_website=eq.true&order=updated_at.desc'),
      loadRows(baseUrl, apiKey, 'creators', 'select=slug,updated_at&is_active=eq.true&order=updated_at.desc'),
    ])
    for (const row of news) if (row.slug) paths.set(directNewsPath(row.slug), validDate(row.updated_at || row.published_at))
    for (const row of books) if (row.slug) paths.set(`/books/${row.slug}`, validDate(row.updated_at))
    for (const row of creators) if (row.slug) paths.set(`/creators/${row.slug}`, validDate(row.updated_at))
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths.entries()].map(([path, lastmod]) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=900' } })
}
