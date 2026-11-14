import { supabase } from './supabase'

export type SupabaseCatalogSnapshot = {
  books: number
  creators: number
  taxonomyTerms: number
  homepageModules: number
}

export type PublicCatalogProduct = {
  id: string
  isbn: string
  slug: string
  title: string
  image: string
  gallery: string[]
  author: string
  translators: string[]
  illustrators: string[]
  price: string
  categories: string[]
  publisher: string
  writerType: 'Authors' | 'Translators'
  year?: number
  available: boolean
  moduleSlugs: string[]
  samplePdfUrl?: string
  samplePdfPageCount?: number
}

export type PublicCreatorProfile = {
  name: string
  slug: string
  roles: Array<'author' | 'translator' | 'illustrator'>
  images: string[]
  born: string
  died: string
  awards: number
  academicTitle: string
  bio: string
}

export type PublicNewsPost = {
  image: string
  title: string
  titleVi: string
  date: string
  kicker: string
  slug: string
  excerpt: string
  excerptVi: string
  body: string[]
  bodyVi: string[]
  contentType: 'news' | 'emagazine'
  byline: string
  blocks: PublicNewsBlock[]
  blocksVi: PublicNewsBlock[]
}

export type PublicNewsBlock = {
  id: string
  type: 'paragraph' | 'heading' | 'image' | 'quote'
  content: string
  image: string
  alt: string
  caption: string
  fullBleed: boolean
  width?: number
  height?: number
}

export type NewsPostWritePayload = {
  slug: string
  contentType: 'news' | 'emagazine'
  title: string
  titleVi: string
  kicker?: string
  kickerVi?: string
  excerpt?: string
  excerptVi?: string
  body?: string[]
  bodyVi?: string[]
  image?: string
  byline?: string
  blocks?: Array<Omit<PublicNewsBlock, 'id'>>
  blocksVi?: Array<Omit<PublicNewsBlock, 'id'>>
}

const publicMediaUrl = (storagePath: string) => {
  if (/^https?:\/\//i.test(storagePath)) return storagePath
  if (storagePath.startsWith('/assets/')) return storagePath
  return `https://linerybooks.vn${storagePath.startsWith('/') ? '' : '/'}${storagePath}`
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))]
const asArray = <T,>(value: T | T[] | null | undefined): T[] => value == null ? [] : Array.isArray(value) ? value : [value]

let publicCatalogPromise: Promise<PublicCatalogProduct[] | null> | null = null
let publicBookSamplePromise = new Map<string, Promise<{ url?: string; pageCount?: number; fileType?: 'pdf' | 'epub' } | null>>()
let publicCreatorsPromise: Promise<PublicCreatorProfile[] | null> | null = null
let publicNewsPromise: Promise<PublicNewsPost[] | null> | null = null

const publicCatalogCacheKey = 'linery-public-catalog-v2'

export function getCachedPublicCatalogProducts(): PublicCatalogProduct[] | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = JSON.parse(window.localStorage.getItem(publicCatalogCacheKey) ?? 'null')
    return Array.isArray(cached) && cached.length > 0 ? cached as PublicCatalogProduct[] : null
  } catch {
    return null
  }
}

export async function loadPublicHomepageProducts(): Promise<PublicCatalogProduct[] | null> {
  if (!supabase) return null
  const modules = await supabase.from('book_homepage_modules').select('book_id,sort_order,homepage_modules(name,slug)').order('sort_order', { ascending: true })
  if (modules.error) throw modules.error
  const moduleRows = (modules.data ?? []) as Array<{ book_id: string; homepage_modules: { name: string; slug: string } | Array<{ name: string; slug: string }> | null }>
  const bookIds = [...new Set(moduleRows.map((row) => row.book_id).filter(Boolean))]
  if (!bookIds.length) return []
  const [books, images, creators] = await Promise.all([
    supabase.from('books').select('id,isbn,title,slug,sale_price_vnd,publication_date,inventory_quantity,reserved_inventory_quantity,cover_storage_path').in('id', bookIds).eq('status', 'active').eq('is_visible_website', true),
    supabase.from('book_images').select('book_id,storage_path,sort_order,is_primary').in('book_id', bookIds).order('sort_order', { ascending: true }),
    supabase.from('book_creators').select('book_id,role,sort_order,creators(display_name,slug)').in('book_id', bookIds).order('sort_order', { ascending: true }),
  ])
  const error = books.error ?? images.error ?? creators.error
  if (error) throw error
  const imageRows = (images.data ?? []) as Array<{ book_id: string; storage_path: string; sort_order: number; is_primary: boolean }>
  const creatorRows = (creators.data ?? []) as Array<{ book_id: string; role: 'author' | 'translator' | 'illustrator'; sort_order: number; creators: { display_name: string; slug: string } | Array<{ display_name: string; slug: string }> | null }>
  const imagesByBook = new Map<string, typeof imageRows>()
  const creatorsByBook = new Map<string, typeof creatorRows>()
  for (const row of imageRows) imagesByBook.set(row.book_id, [...(imagesByBook.get(row.book_id) ?? []), row])
  for (const row of creatorRows) creatorsByBook.set(row.book_id, [...(creatorsByBook.get(row.book_id) ?? []), row])
  const modulesByBook = new Map<string, string[]>()
  for (const row of moduleRows) {
    const linkedModules = asArray(row.homepage_modules)
    modulesByBook.set(row.book_id, unique([...(modulesByBook.get(row.book_id) ?? []), ...linkedModules.map((module) => module.slug)]))
  }
  return ((books.data ?? []) as Array<Record<string, unknown>>).map((book) => {
    const id = String(book.id)
    const bookImages = (imagesByBook.get(id) ?? []).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order).map((row) => publicMediaUrl(row.storage_path))
    const bookCreators = creatorsByBook.get(id) ?? []
    const authors = bookCreators.filter((row) => row.role === 'author').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const translators = bookCreators.filter((row) => row.role === 'translator').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const inventory = Number(book.inventory_quantity ?? 0)
    const reserved = Number(book.reserved_inventory_quantity ?? 0)
    return {
      id,
      isbn: String(book.isbn ?? ''),
      slug: String(book.slug ?? ''),
      title: String(book.title ?? ''),
      image: bookImages[0] ?? publicMediaUrl(String(book.cover_storage_path ?? '')),
      gallery: bookImages,
      author: authors[0] ?? translators[0] ?? 'Linery Books',
      translators: unique(translators),
      illustrators: [],
      price: Number(book.sale_price_vnd ?? 0).toLocaleString('vi-VN') + '₫',
      categories: [],
      publisher: 'Linery Books',
      writerType: authors.length > 0 ? 'Authors' : 'Translators',
      year: book.publication_date ? Number(String(book.publication_date).slice(0, 4)) : undefined,
      available: inventory > reserved,
      moduleSlugs: modulesByBook.get(id) ?? [],
    } satisfies PublicCatalogProduct
  }).filter((book) => book.title && book.image)
}

export async function loadPublicCatalogProducts(): Promise<PublicCatalogProduct[] | null> {
  if (!supabase) return null
  if (publicCatalogPromise) return publicCatalogPromise
  publicCatalogPromise = (async () => {
    const books = await supabase.from('books').select('id,isbn,title,slug,sale_price_vnd,publication_date,inventory_quantity,reserved_inventory_quantity,cover_storage_path').eq('status', 'active').eq('is_visible_website', true).order('created_at', { ascending: false })
    const error = books.error
    if (error) throw error
    const bookIds = ((books.data ?? []) as Array<{ id: string }>).map((book) => book.id)
    if (!bookIds.length) return []
    const [images, creators, terms, modules] = await Promise.all([
      supabase.from('book_images').select('book_id,storage_path,sort_order,is_primary').in('book_id', bookIds).order('sort_order', { ascending: true }),
      supabase.from('book_creators').select('book_id,creator_id,role,sort_order,creators(display_name,slug)').in('book_id', bookIds).order('sort_order', { ascending: true }),
      supabase.from('book_taxonomy_terms').select('book_id,term_id,taxonomy_terms(kind,name,slug)').in('book_id', bookIds).order('term_id', { ascending: true }),
      supabase.from('book_homepage_modules').select('book_id,module_id,sort_order,homepage_modules(name,slug)').in('book_id', bookIds).order('sort_order', { ascending: true }),
    ])
    const relatedError = images.error ?? creators.error ?? terms.error ?? modules.error
    if (relatedError) throw relatedError

  const imageRows = (images.data ?? []) as Array<{ book_id: string; storage_path: string; sort_order: number; is_primary: boolean }>
  const creatorRows = (creators.data ?? []) as Array<{ book_id: string; role: 'author' | 'translator' | 'illustrator'; sort_order: number; creators: Array<{ display_name: string }> | null }>
  const termRows = (terms.data ?? []) as Array<{ book_id: string; taxonomy_terms: Array<{ kind: string; name: string; slug: string }> | null }>
  const moduleRows = (modules.data ?? []) as Array<{ book_id: string; homepage_modules: Array<{ name: string; slug: string }> | null }>
  const imagesByBook = new Map<string, typeof imageRows>()
  const creatorsByBook = new Map<string, typeof creatorRows>()
  const termsByBook = new Map<string, typeof termRows>()
  const modulesByBook = new Map<string, typeof moduleRows>()
  for (const row of imageRows) imagesByBook.set(row.book_id, [...(imagesByBook.get(row.book_id) ?? []), row])
  for (const row of creatorRows) creatorsByBook.set(row.book_id, [...(creatorsByBook.get(row.book_id) ?? []), row])
  for (const row of termRows) termsByBook.set(row.book_id, [...(termsByBook.get(row.book_id) ?? []), row])
  for (const row of moduleRows) modulesByBook.set(row.book_id, [...(modulesByBook.get(row.book_id) ?? []), row])

    return ((books.data ?? []) as Array<Record<string, unknown>>).map((book) => {
    const id = String(book.id)
    const bookImages = (imagesByBook.get(id) ?? []).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order).map((row) => publicMediaUrl(row.storage_path))
    const bookCreators = creatorsByBook.get(id) ?? []
    const authors = bookCreators.filter((row) => row.role === 'author').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const translators = bookCreators.filter((row) => row.role === 'translator').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const illustrators = bookCreators.filter((row) => row.role === 'illustrator').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const bookTerms = (termsByBook.get(id) ?? []).flatMap((row) => asArray(row.taxonomy_terms))
    const categories = unique(bookTerms.filter((term) => ['category', 'genre', 'topic'].includes(term.kind)).map((term) => term.name))
    const publisher = bookTerms.find((term) => term.kind === 'publisher')?.name ?? 'Linery Books'
    const price = Number(book.sale_price_vnd ?? 0).toLocaleString('vi-VN') + '₫'
    const inventory = Number(book.inventory_quantity ?? 0)
    const reserved = Number(book.reserved_inventory_quantity ?? 0)
    const image = bookImages[0] ?? publicMediaUrl(String(book.cover_storage_path ?? ''))
    return {
      id,
      isbn: String(book.isbn ?? ''),
      slug: String(book.slug ?? ''),
      title: String(book.title ?? ''),
      image,
      gallery: bookImages,
      author: authors[0] ?? translators[0] ?? 'Linery Books',
      translators: unique(translators),
      illustrators: unique(illustrators),
      price,
      categories,
      publisher,
      writerType: authors.length > 0 ? 'Authors' : 'Translators',
      year: book.publication_date ? Number(String(book.publication_date).slice(0, 4)) : undefined,
      available: inventory > reserved,
      moduleSlugs: unique((modulesByBook.get(id) ?? []).flatMap((row) => asArray(row.homepage_modules).map((module) => module.slug))),
    } satisfies PublicCatalogProduct
    }).filter((book) => book.title && book.image)
  })()
  publicCatalogPromise.then((records) => {
    if (typeof window !== 'undefined' && records?.length) {
      try { window.localStorage.setItem(publicCatalogCacheKey, JSON.stringify(records)) } catch { /* cache is best effort */ }
    }
  }).catch(() => undefined)
  publicCatalogPromise.catch(() => { publicCatalogPromise = null })
  return publicCatalogPromise
}

export async function loadPublicBookSample(bookId: string, bookSlug?: string): Promise<{ url?: string; pageCount?: number; fileType?: 'pdf' | 'epub' } | null> {
  if (!supabase || !bookId) return null
  const cached = publicBookSamplePromise.get(bookId)
  if (cached) return cached
  const request = (async () => {
    const { data, error } = await supabase.from('books').select('sample_pdf_storage_path,sample_pdf_page_count,sample_pdf_enabled,sample_file_type').eq('id', bookId).maybeSingle()
    if (error) {
      if (import.meta.env.DEV && bookSlug === 'a-manual-for-cleaning-women') return { url: '/assets/book-samples/a-manual-for-cleaning-women.pdf', pageCount: 4, fileType: 'pdf' as const }
      return null
    }
    const row = data as { sample_pdf_storage_path?: string | null; sample_pdf_page_count?: number | null; sample_pdf_enabled?: boolean | null; sample_file_type?: 'pdf' | 'epub' | null } | null
    if (!row?.sample_pdf_enabled || !row.sample_pdf_storage_path) {
      if (import.meta.env.DEV && bookSlug === 'a-manual-for-cleaning-women') return { url: '/assets/book-samples/a-manual-for-cleaning-women.pdf', pageCount: 4, fileType: 'pdf' as const }
      return null
    }
    const fileType: 'pdf' | 'epub' = row.sample_file_type === 'epub' || /\.epub(?:$|\?)/i.test(row.sample_pdf_storage_path) ? 'epub' : 'pdf'
    return { url: publicMediaUrl(row.sample_pdf_storage_path), pageCount: row.sample_pdf_page_count ? Number(row.sample_pdf_page_count) : undefined, fileType }
  })()
  publicBookSamplePromise.set(bookId, request)
  return request
}

export async function loadPublicCreatorProfiles(): Promise<PublicCreatorProfile[] | null> {
  if (!supabase) return null
  if (publicCreatorsPromise) return publicCreatorsPromise
  publicCreatorsPromise = (async () => {
    const [creators, images, creatorRoles] = await Promise.all([
    supabase.from('creators').select('id,display_name,slug,bio_html,birth_year,death_year,awards').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('creator_images').select('creator_id,storage_path,sort_order,is_primary').order('sort_order', { ascending: true }),
    supabase.from('book_creators').select('creator_id,role,sort_order').order('sort_order', { ascending: true }),
    ])
    const error = creators.error ?? images.error ?? creatorRoles.error
    if (error) throw error
  const imageRows = (images.data ?? []) as Array<{ creator_id: string; storage_path: string; sort_order: number; is_primary: boolean }>
    const roleRows = (creatorRoles.data ?? []) as Array<{ creator_id: string; role: 'author' | 'translator' | 'illustrator'; sort_order: number }>
    const rolesByCreator = new Map<string, Array<'author' | 'translator' | 'illustrator'>>()
    for (const row of roleRows) {
      if (!rolesByCreator.has(row.creator_id)) rolesByCreator.set(row.creator_id, [])
      const roles = rolesByCreator.get(row.creator_id) ?? []
      if (!roles.includes(row.role)) roles.push(row.role)
    }
    return ((creators.data ?? []) as Array<Record<string, unknown>>).map((creator) => {
    const id = String(creator.id)
    const creatorImages = imageRows
      .filter((row) => row.creator_id === id)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
      .map((row) => publicMediaUrl(row.storage_path))
    const birthYear = creator.birth_year == null ? '' : String(creator.birth_year)
    const deathYear = creator.death_year == null ? '' : String(creator.death_year)
    const awardsText = String(creator.awards ?? '').trim()
    const awardCount = awardsText && awardsText !== '-' ? awardsText.split(';').map((award) => award.trim()).filter(Boolean).length : 0
    return {
      name: String(creator.display_name ?? ''),
      slug: String(creator.slug ?? ''),
      roles: rolesByCreator.get(id) ?? [],
      images: unique(creatorImages),
      born: birthYear,
      died: deathYear,
      awards: awardCount,
      academicTitle: '—',
      bio: String(creator.bio_html ?? '').trim(),
    }
    }).filter((creator) => creator.name)
  })()
  publicCreatorsPromise.catch(() => { publicCreatorsPromise = null })
  return publicCreatorsPromise
}

export async function loadPublicNewsPosts(): Promise<PublicNewsPost[] | null> {
  if (!supabase) return null
  if (publicNewsPromise) return publicNewsPromise
  publicNewsPromise = (async () => {
    const [{ data, error }, { data: blockData, error: blockError }] = await Promise.all([
    supabase.from('news_posts').select('id,slug,content_type,published_at,image_storage_path,title_en,title_vi,kicker_en,kicker_vi,excerpt_en,excerpt_vi,body_en,body_vi,byline').eq('status', 'active').order('published_at', { ascending: false, nullsFirst: false }),
    supabase.from('news_post_blocks').select('id,news_post_id,language,block_type,sort_order,content,image_storage_path,image_alt,caption,is_full_bleed,image_width,image_height').order('sort_order', { ascending: true }),
    ])
    if (error) throw error
    if (blockError) throw blockError
  const blocksByPost = new Map<string, { en: PublicNewsBlock[]; vi: PublicNewsBlock[] }>()
  for (const row of (blockData ?? []) as Array<Record<string, unknown>>) {
    const postId = String(row.news_post_id ?? '')
    if (!postId) continue
    const grouped = blocksByPost.get(postId) ?? { en: [], vi: [] }
    const block: PublicNewsBlock = {
      id: String(row.id ?? `${postId}-${row.sort_order}`),
      type: (['paragraph', 'heading', 'image', 'quote'].includes(String(row.block_type)) ? String(row.block_type) : 'paragraph') as PublicNewsBlock['type'],
      content: String(row.content ?? ''),
      image: publicMediaUrl(String(row.image_storage_path ?? '')),
      alt: String(row.image_alt ?? ''),
      caption: String(row.caption ?? ''),
      fullBleed: Boolean(row.is_full_bleed),
      width: row.image_width == null ? undefined : Number(row.image_width),
      height: row.image_height == null ? undefined : Number(row.image_height),
    }
    grouped[String(row.language) === 'vi' ? 'vi' : 'en'].push(block)
    blocksByPost.set(postId, grouped)
  }
    return ((data ?? []) as Array<Record<string, unknown>>).map((post) => {
    const grouped = blocksByPost.get(String(post.id)) ?? { en: [], vi: [] }
    return {
    image: publicMediaUrl(String(post.image_storage_path ?? '')),
    title: String(post.title_en ?? ''),
    titleVi: String(post.title_vi ?? ''),
    date: post.published_at ? new Date(String(post.published_at)).toLocaleDateString('en-GB') : '',
    kicker: String(post.kicker_en ?? ''),
    slug: String(post.slug ?? ''),
    excerpt: String(post.excerpt_en ?? ''),
    excerptVi: String(post.excerpt_vi ?? ''),
    body: asArray(post.body_en).map(String),
    bodyVi: asArray(post.body_vi).map(String),
    contentType: (post.content_type === 'emagazine' ? 'emagazine' : 'news') as PublicNewsPost['contentType'],
    byline: String(post.byline ?? ''),
    blocks: grouped.en.length > 0 ? grouped.en : grouped.vi,
    blocksVi: grouped.vi.length > 0 ? grouped.vi : grouped.en,
  }
    }).filter((post) => post.slug && post.title)
  })()
  publicNewsPromise.catch(() => { publicNewsPromise = null })
  return publicNewsPromise
}

const newsWriteRow = (payload: NewsPostWritePayload) => ({
  slug: payload.slug,
  content_type: payload.contentType,
  status: 'active',
  published_at: new Date().toISOString(),
  image_storage_path: payload.image ?? '/assets/news-instagram-01.jpg',
  title_en: payload.title,
  title_vi: payload.titleVi,
  kicker_en: payload.kicker ?? (payload.contentType === 'emagazine' ? 'eMagazine' : 'News'),
  kicker_vi: payload.kickerVi ?? (payload.contentType === 'emagazine' ? 'eMagazine' : 'Tin tức'),
  excerpt_en: payload.excerpt ?? '',
  excerpt_vi: payload.excerptVi ?? payload.excerpt ?? '',
  body_en: payload.body ?? [],
  body_vi: payload.bodyVi ?? payload.body ?? [],
  byline: payload.byline ?? '',
})

export async function upsertNewsPost(payload: NewsPostWritePayload): Promise<{ id: string; slug: string }> {
  const client = supabase
  if (!client) throw new Error('Supabase chưa được cấu hình.')
  const { data, error } = await client.from('news_posts').upsert(newsWriteRow(payload), { onConflict: 'slug' }).select('id,slug').single()
  if (error) throw error
  const post = data as { id: string; slug: string }
  const saveBlocks = async (language: 'en' | 'vi', blocks: Array<Omit<PublicNewsBlock, 'id'>>) => {
    if (!blocks.length) return
    const rows = blocks.map((block, index) => ({
      news_post_id: post.id,
      language,
      block_type: block.type,
      sort_order: index,
      content: block.content ?? '',
      image_storage_path: block.image || null,
      image_alt: block.alt ?? '',
      caption: block.caption ?? '',
      is_full_bleed: Boolean(block.fullBleed),
      image_width: block.width ?? null,
      image_height: block.height ?? null,
    }))
    const { error: blockError } = await client.from('news_post_blocks').upsert(rows, { onConflict: 'news_post_id,language,sort_order' })
    if (blockError) throw blockError
  }
  const enBlocks = payload.blocks ?? []
  const viBlocks = payload.blocksVi ?? enBlocks
  if (enBlocks.length || viBlocks.length) {
    const { error: deleteError } = await client.from('news_post_blocks').delete().eq('news_post_id', post.id)
    if (deleteError) throw deleteError
    await saveBlocks('en', enBlocks)
    await saveBlocks('vi', viBlocks)
  }
  publicNewsPromise = null
  return post
}

export async function loadSupabaseCatalogSnapshot(): Promise<SupabaseCatalogSnapshot | null> {
  if (!supabase) return null
  const [books, creators, taxonomyTerms, homepageModules] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('creators').select('id', { count: 'exact', head: true }),
    supabase.from('taxonomy_terms').select('id', { count: 'exact', head: true }),
    supabase.from('homepage_modules').select('id', { count: 'exact', head: true }),
  ])
  const error = books.error ?? creators.error ?? taxonomyTerms.error ?? homepageModules.error
  if (error) throw error
  return {
    books: books.count ?? 0,
    creators: creators.count ?? 0,
    taxonomyTerms: taxonomyTerms.count ?? 0,
    homepageModules: homepageModules.count ?? 0,
  }
}
