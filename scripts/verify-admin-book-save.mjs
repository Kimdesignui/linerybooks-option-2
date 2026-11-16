import fs from 'node:fs'

const isbn = process.argv[2] ?? process.env.LINERY_TEST_BOOK_ISBN
if (!isbn) throw new Error('Cần truyền ISBN kiểm thử, ví dụ: node scripts/verify-admin-book-save.mjs 9781234567891')
const expectsHomepageModule = process.argv.includes('--expect-home-module') || process.env.LINERY_EXPECT_HOMEPAGE_MODULE === '1'

const env = Object.fromEntries(
  fs.readFileSync('.env.enhanced', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
    }),
)
const baseUrl = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY
if (!baseUrl || !anonKey) throw new Error('Thiếu cấu hình Supabase trong .env.enhanced.')
const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` }

async function rows(table, query) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, { headers })
  if (!response.ok) throw new Error(`${table}: HTTP ${response.status} ${await response.text()}`)
  return response.json()
}

const books = await rows('books', new URLSearchParams({
  select: 'id,isbn,title,cover_price_usd,sale_price_vnd,compare_price_vnd,inventory_quantity,is_visible_website,description_html',
  isbn: `eq.${isbn}`,
}).toString())
if (books.length !== 1) throw new Error(`ISBN ${isbn} có ${books.length} bản ghi, cần đúng 1.`)
const book = books[0]
const [creators, taxonomy, modules] = await Promise.all([
  rows('book_creators', new URLSearchParams({ select: 'creator_id,role', book_id: `eq.${book.id}` }).toString()),
  rows('book_taxonomy_terms', new URLSearchParams({ select: 'term_id', book_id: `eq.${book.id}` }).toString()),
  rows('book_homepage_modules', new URLSearchParams({ select: 'module_id,sort_order', book_id: `eq.${book.id}` }).toString()),
])

const checks = {
  title: Boolean(book.title),
  prices: Number(book.cover_price_usd) > 0 && Number(book.sale_price_vnd) > 0 && Number(book.compare_price_vnd) > Number(book.sale_price_vnd),
  inventory: Number(book.inventory_quantity) > 0,
  description: Boolean(book.description_html),
  visible: book.is_visible_website === true,
  creatorLink: creators.some((row) => row.role === 'author'),
  taxonomyLinks: taxonomy.length >= 5,
  homepageModuleLink: !expectsHomepageModule || modules.length >= 1,
}
console.log(JSON.stringify({ isbn, id: book.id, title: book.title, checks, creatorLinks: creators.length, taxonomyLinks: taxonomy.length, homepageModuleLinks: modules.length, expectsHomepageModule }, null, 2))
if (Object.values(checks).some((value) => !value)) process.exitCode = 1
