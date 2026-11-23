type SeoEnv = Record<string, unknown>
type SeoContext = { request: Request; env: SeoEnv; next: () => Promise<Response> }
type SeoRecord = Record<string, unknown>
type SeoPayload = { kind: 'book' | 'article'; title: string; description: string; image: string; canonicalPath: string; publishedAt?: string; author?: string; isbn?: string; publisher?: string; price?: number; available?: boolean }

const directNewsSlugs = new Set(['gioi-thieu', 'lien-he'])
const siteName = 'Linery Books'

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const escapeJsonForHtml = (value: string) => value.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
const stripHtml = (value: string) => value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, ' ').replace(/&#39;/gi, "'").replace(/\s+/g, ' ').trim()
const truncate = (value: string, length = 160) => value.length <= length ? value : `${value.slice(0, length - 1).trimEnd()}…`
const validIso = (value: unknown) => {
  const date = new Date(String(value ?? ''))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
const directNewsPath = (slug: string) => directNewsSlugs.has(slug) ? `/${slug}` : `/news/${slug}`
const publicImageUrl = (baseUrl: string, origin: string, storagePath: string) => {
  if (!storagePath) return `${origin}/assets/linery-image-placeholder.svg`
  if (/^https?:\/\//i.test(storagePath)) return storagePath
  if (storagePath.startsWith('/')) return `${origin}${storagePath}`
  return `${baseUrl}/storage/v1/object/public/site-media/${storagePath.split('/').map(encodeURIComponent).join('/')}`
}

const getEnv = (env: SeoEnv, ...keys: string[]) => keys.map((key) => env[key]).find((value) => typeof value === 'string' && value.trim()) as string | undefined
const fetchOne = async (baseUrl: string, apiKey: string, resource: string, filters: Record<string, string>) => {
  const query = new URLSearchParams({ select: '*', limit: '1', ...filters })
  try {
    const response = await fetch(`${baseUrl}/rest/v1/${resource}?${query.toString()}`, { headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` } })
    if (!response.ok) return null
    const data = await response.json() as unknown
    return Array.isArray(data) ? (data[0] as SeoRecord | undefined) ?? null : null
  } catch {
    return null
  }
}

const fallbackNews: Record<string, Omit<SeoPayload, 'canonicalPath'>> = {
  'gioi-thieu': { kind: 'article', title: 'About Linery Books | English Bookstore in Hanoi', description: 'Discover Linery Books, a curated English bookstore on Hanoi Book Street with imported books for curious readers.', image: '/assets/login-bookstore.png' },
  'lien-he': { kind: 'article', title: 'Contact Linery Books | Hanoi English Bookstore', description: 'Contact Linery Books about English books, special orders, partnerships and visiting our Hanoi Book Street store.', image: '/assets/login-library-reader.png' },
}

const loadSeoPayload = async (request: Request, env: SeoEnv, origin: string, pathname: string): Promise<SeoPayload | null> => {
  const bookMatch = /^\/books\/([^/]+)$/.exec(pathname)
  const newsSlug = pathname.startsWith('/news/') ? pathname.split('/').pop() ?? '' : pathname.slice(1)
  const isNewsPath = pathname === '/gioi-thieu' || pathname === '/lien-he' || pathname.startsWith('/news/')
  if (!bookMatch && !isNewsPath) return null
  const baseUrl = getEnv(env, 'SUPABASE_URL', 'VITE_SUPABASE_URL')?.replace(/\/$/, '')
  const apiKey = getEnv(env, 'SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')
  const language = request.headers.get('accept-language')?.toLowerCase().startsWith('vi') ? 'vi' : 'en'
  if (bookMatch) {
    if (!baseUrl || !apiKey) return null
    const row = await fetchOne(baseUrl, apiKey, 'books', { slug: `eq.${encodeURIComponent(bookMatch[1])}`, status: 'eq.active', is_visible_website: 'eq.true' })
    if (!row) return null
    const title = String(row.title ?? '').trim()
    if (!title) return null
    const description = truncate(stripHtml(String(language === 'vi' ? row.description_html_vi ?? row.description_html ?? '' : row.description_html ?? row.description_html_vi ?? ''))) || `${title} tại ${siteName}.`
    return { kind: 'book', title: `${title} | ${siteName}`, description, image: publicImageUrl(baseUrl, origin, String(row.cover_storage_path ?? '')), canonicalPath: `/books/${bookMatch[1]}`, isbn: String(row.isbn ?? ''), publisher: siteName, price: Number(row.sale_price_vnd ?? 0), available: Number(row.inventory_quantity ?? 0) > Number(row.reserved_inventory_quantity ?? 0), publishedAt: validIso(row.publication_date) }
  }
  const fallback = fallbackNews[newsSlug]
  const row = baseUrl && apiKey ? await fetchOne(baseUrl, apiKey, 'news_posts', { slug: `eq.${encodeURIComponent(newsSlug)}`, status: 'eq.active' }) : null
  if (!row && !fallback) return null
  const title = row ? String(language === 'vi' ? row.seo_title_vi || row.title_vi : row.seo_title_en || row.title_en).trim() : fallback!.title
  const description = row ? truncate(stripHtml(String(language === 'vi' ? row.seo_description_vi || row.excerpt_vi : row.seo_description_en || row.excerpt_en))) : fallback!.description
  return { kind: 'article', title: `${title} | ${siteName}`, description, image: row && baseUrl ? publicImageUrl(baseUrl, origin, String(row.image_storage_path ?? '')) : `${origin}${fallback!.image}`, canonicalPath: directNewsPath(newsSlug), publishedAt: validIso(row?.published_at), author: String(row?.byline ?? siteName) }
}

const injectSeo = (html: string, origin: string, payload: SeoPayload) => {
  const canonicalUrl = `${origin}${payload.canonicalPath}`
  const imageUrl = payload.image.startsWith('http') ? payload.image : `${origin}${payload.image}`
  const jsonLd: SeoRecord = payload.kind === 'book'
    ? { '@context': 'https://schema.org', '@type': ['Product', 'Book'], name: payload.title.replace(` | ${siteName}`, ''), url: canonicalUrl, image: imageUrl, isbn: payload.isbn || undefined, description: payload.description, author: { '@type': 'Organization', name: siteName }, publisher: { '@type': 'Organization', name: payload.publisher || siteName }, offers: { '@type': 'Offer', priceCurrency: 'VND', price: payload.price || 0, availability: payload.available === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: canonicalUrl } }
    : { '@context': 'https://schema.org', '@type': 'Article', headline: payload.title.replace(` | ${siteName}`, ''), description: payload.description, image: [imageUrl], url: canonicalUrl, datePublished: payload.publishedAt, author: { '@type': 'Organization', name: payload.author || siteName }, publisher: { '@type': 'Organization', name: siteName }, mainEntityOfPage: canonicalUrl }
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }, { '@type': 'ListItem', position: 2, name: payload.kind === 'book' ? 'Books' : 'News', item: `${origin}/${payload.kind === 'book' ? 'all-books' : 'news'}` }, { '@type': 'ListItem', position: 3, name: payload.title.replace(` | ${siteName}`, ''), item: canonicalUrl }] }
  const metas = [
    `<title>${escapeHtml(payload.title)}</title>`,
    `<meta name="description" content="${escapeHtml(payload.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:type" content="${payload.kind === 'book' ? 'product' : 'article'}" />`,
    `<meta property="og:title" content="${escapeHtml(payload.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(payload.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script id="linery-seo-edge" type="application/ld+json">${escapeJsonForHtml(JSON.stringify([jsonLd, breadcrumb]))}</script>`,
  ].join('\n    ')
  return html.replace(/<title>[\s\S]*?<\/title>/i, '').replace('</head>', `    ${metas}\n  </head>`)
}

export async function onRequest(context: SeoContext) {
  const url = new URL(context.request.url)
  if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt' || url.pathname.startsWith('/api/') || /\.[a-z0-9]{2,8}$/i.test(url.pathname)) return context.next()
  const response = await context.next()
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return response
  const payload = await loadSeoPayload(context.request, context.env, url.origin, url.pathname)
  if (!payload) return response
  const html = await response.text()
  return new Response(injectSeo(html, url.origin, payload), { status: response.status, headers: new Headers(response.headers) })
}
