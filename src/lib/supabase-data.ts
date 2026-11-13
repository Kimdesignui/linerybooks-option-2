import { supabase } from './supabase'
import creatorImageMap from '../data/creator-image-map.json'

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
  price: string
  categories: string[]
  publisher: string
  writerType: 'Authors' | 'Translators'
  year?: number
  available: boolean
  moduleSlugs: string[]
}

export type PublicCreatorProfile = {
  name: string
  slug: string
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

const publicMediaUrl = (storagePath: string) => {
  if (/^https?:\/\//i.test(storagePath)) return storagePath
  if (storagePath.startsWith('/assets/')) return storagePath
  return `https://linerybooks.vn${storagePath.startsWith('/') ? '' : '/'}${storagePath}`
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))]
const asArray = <T,>(value: T | T[] | null | undefined): T[] => value == null ? [] : Array.isArray(value) ? value : [value]

export async function loadPublicCatalogProducts(): Promise<PublicCatalogProduct[] | null> {
  if (!supabase) return null
  const [books, images, creators, terms, modules] = await Promise.all([
    supabase.from('books').select('id,isbn,title,slug,sale_price_vnd,publication_date,inventory_quantity,reserved_inventory_quantity,cover_storage_path').eq('status', 'active').eq('is_visible_website', true).order('created_at', { ascending: false }),
    supabase.from('book_images').select('book_id,storage_path,sort_order,is_primary').order('sort_order', { ascending: true }),
    supabase.from('book_creators').select('book_id,creator_id,role,sort_order,creators(display_name,slug)').order('sort_order', { ascending: true }),
    supabase.from('book_taxonomy_terms').select('book_id,term_id,taxonomy_terms(kind,name,slug)').order('term_id', { ascending: true }),
    supabase.from('book_homepage_modules').select('book_id,module_id,sort_order,homepage_modules(name,slug)').order('sort_order', { ascending: true }),
  ])
  const error = books.error ?? images.error ?? creators.error ?? terms.error ?? modules.error
  if (error) throw error

  const imageRows = (images.data ?? []) as Array<{ book_id: string; storage_path: string; sort_order: number; is_primary: boolean }>
  const creatorRows = (creators.data ?? []) as Array<{ book_id: string; role: 'author' | 'translator' | 'illustrator'; sort_order: number; creators: Array<{ display_name: string }> | null }>
  const termRows = (terms.data ?? []) as Array<{ book_id: string; taxonomy_terms: Array<{ kind: string; name: string; slug: string }> | null }>
  const moduleRows = (modules.data ?? []) as Array<{ book_id: string; homepage_modules: Array<{ name: string; slug: string }> | null }>

  return ((books.data ?? []) as Array<Record<string, unknown>>).map((book) => {
    const id = String(book.id)
    const bookImages = imageRows.filter((row) => row.book_id === id).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order).map((row) => publicMediaUrl(row.storage_path))
    const bookCreators = creatorRows.filter((row) => row.book_id === id)
    const authors = bookCreators.filter((row) => row.role === 'author').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const translators = bookCreators.filter((row) => row.role === 'translator').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const bookTerms = termRows.filter((row) => row.book_id === id).flatMap((row) => asArray(row.taxonomy_terms))
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
      price,
      categories,
      publisher,
      writerType: authors.length > 0 ? 'Authors' : 'Translators',
      year: book.publication_date ? Number(String(book.publication_date).slice(0, 4)) : undefined,
      available: inventory > reserved,
      moduleSlugs: unique(moduleRows.filter((row) => row.book_id === id).flatMap((row) => asArray(row.homepage_modules).map((module) => module.slug))),
    } satisfies PublicCatalogProduct
  }).filter((book) => book.title && book.image)
}

export async function loadPublicCreatorProfiles(): Promise<PublicCreatorProfile[] | null> {
  if (!supabase) return null
  const [creators, images] = await Promise.all([
    supabase.from('creators').select('id,display_name,slug,bio_html,birth_year,death_year,awards').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('creator_images').select('creator_id,storage_path,sort_order,is_primary').order('sort_order', { ascending: true }),
  ])
  const error = creators.error ?? images.error
  if (error) throw error
  const imageRows = (images.data ?? []) as Array<{ creator_id: string; storage_path: string; sort_order: number; is_primary: boolean }>
  return ((creators.data ?? []) as Array<Record<string, unknown>>).map((creator) => {
    const id = String(creator.id)
    const creatorImages = imageRows
      .filter((row) => row.creator_id === id)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
      .map((row) => publicMediaUrl(row.storage_path))
    const localCreatorImage = (creatorImageMap as Record<string, string>)[String(creator.slug ?? '')]
    const birthYear = creator.birth_year == null ? '' : String(creator.birth_year)
    const deathYear = creator.death_year == null ? '' : String(creator.death_year)
    const awardsText = String(creator.awards ?? '').trim()
    const awardCount = awardsText && awardsText !== '-' ? awardsText.split(';').map((award) => award.trim()).filter(Boolean).length : 0
    return {
      name: String(creator.display_name ?? ''),
      slug: String(creator.slug ?? ''),
      images: unique([localCreatorImage ?? '', ...creatorImages]),
      born: birthYear,
      died: deathYear,
      awards: awardCount,
      academicTitle: '—',
      bio: String(creator.bio_html ?? '').trim(),
    }
  }).filter((creator) => creator.name)
}

export async function loadPublicNewsPosts(): Promise<PublicNewsPost[] | null> {
  if (!supabase) return null
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
