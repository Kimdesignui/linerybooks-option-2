import fs from 'node:fs'
import path from 'node:path'

const envPath = path.resolve('.env.enhanced')
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=')
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
    }),
)

const baseUrl = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY
if (!baseUrl || !anonKey) throw new Error('Thiếu cấu hình Supabase trong .env.enhanced.')

async function rows(table, select) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?select=${select}&limit=1000`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  })
  if (!response.ok) throw new Error(`${table}: HTTP ${response.status} ${await response.text()}`)
  return response.json()
}

const [creators, images, links] = await Promise.all([
  rows('creators', 'id,display_name,slug,is_active'),
  rows('creator_images', 'creator_id'),
  rows('book_creators', 'creator_id'),
])

const imageIds = new Set(images.map((image) => image.creator_id))
const linkedIds = new Set(links.map((link) => link.creator_id))
const mojibake = creators.filter((creator) => /Ã|Â|�/.test(creator.display_name))
const activeUnused = creators.filter((creator) => creator.is_active && !linkedIds.has(creator.id))
const missingImages = creators.filter((creator) => !imageIds.has(creator.id))
const knownImportArtefacts = activeUnused.filter((creator) => ['ag', 'gdagda', 'dgda'].includes(creator.slug))
const duplicateEncodingSlugs = ['frana-ois-rena-de-chateaubriand', 'paul-vala-ry', 'julio-rama-n-ribeyro']
  .map((slug) => creators.find((creator) => creator.slug === slug))
  .filter(Boolean)

console.log(`Creators: ${creators.length}`)
console.log(`Creator images: ${images.length}`)
console.log(`Missing creator images: ${missingImages.length}`)
console.log(`Mojibake names: ${mojibake.length}`)
console.log(`Active unused creators: ${activeUnused.length}`)
console.log(`Known import artefacts: ${knownImportArtefacts.length}`)
if (mojibake.length) console.log(`Mojibake: ${mojibake.map((creator) => `${creator.display_name} [${creator.slug}]`).join(' | ')}`)
if (duplicateEncodingSlugs.length) console.log(`Duplicate encoding rows: ${duplicateEncodingSlugs.map((creator) => creator.slug).join(', ')}`)
if (knownImportArtefacts.length) console.log(`Import artefacts: ${knownImportArtefacts.map((creator) => creator.slug).join(', ')}`)

if (mojibake.length || duplicateEncodingSlugs.length || knownImportArtefacts.length) {
  process.exitCode = 1
}
