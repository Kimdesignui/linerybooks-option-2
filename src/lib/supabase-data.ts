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
    const birthYear = creator.birth_year == null ? '' : String(creator.birth_year)
    const deathYear = creator.death_year == null ? '' : String(creator.death_year)
    const awardsText = String(creator.awards ?? '').trim()
    const awardCount = awardsText && awardsText !== '-' ? awardsText.split(';').map((award) => award.trim()).filter(Boolean).length : 0
    return {
      name: String(creator.display_name ?? ''),
      slug: String(creator.slug ?? ''),
      images: unique(creatorImages),
      born: birthYear,
      died: deathYear,
      awards: awardCount,
      academicTitle: '—',
      bio: String(creator.bio_html ?? '').trim(),
    }
  }).filter((creator) => creator.name)
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
