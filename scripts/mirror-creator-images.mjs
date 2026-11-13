import fs from 'node:fs/promises'
import path from 'node:path'

const readEnv = async () => {
  const text = await fs.readFile('.env.enhanced', 'utf8')
  return Object.fromEntries(text.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^([^#][^=]*)=(.*)$/)
    return match ? [[match[1], match[2]]] : []
  }))
}

const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const env = await readEnv()
const headers = { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` }
const base = env.VITE_SUPABASE_URL
const [creatorsResponse, imagesResponse] = await Promise.all([
  fetch(`${base}/rest/v1/creators?select=id,display_name,slug&limit=1000`, { headers }),
  fetch(`${base}/rest/v1/creator_images?select=creator_id,storage_path,sort_order,is_primary&limit=1000`, { headers }),
])
if (!creatorsResponse.ok || !imagesResponse.ok) throw new Error(`Supabase read failed: ${creatorsResponse.status}/${imagesResponse.status}`)
const creators = await creatorsResponse.json()
const images = await imagesResponse.json()
const outputDir = path.resolve('public/assets/creators')
await fs.mkdir(outputDir, { recursive: true })
const manifest = {}

const mirror = async (creator) => {
  const row = images
    .filter((item) => item.creator_id === creator.id)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || Number(a.sort_order) - Number(b.sort_order))[0]
  if (!row?.storage_path || !/^https?:\/\//i.test(row.storage_path)) return null
  try {
    const response = await fetch(row.storage_path, { headers: { 'user-agent': 'LineryBooks asset mirror' }, signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const filename = `${slugify(creator.slug || creator.display_name)}.${extension}`
    await fs.writeFile(path.join(outputDir, filename), Buffer.from(await response.arrayBuffer()))
    return [creator.slug || slugify(creator.display_name), `/assets/creators/${filename}`]
  } catch {
    return null
  }
}

for (let index = 0; index < creators.length; index += 12) {
  const results = await Promise.all(creators.slice(index, index + 12).map(mirror))
  for (const result of results) if (result) manifest[result[0]] = result[1]
}

await fs.writeFile('src/data/creator-image-map.json', `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`Mirrored ${Object.keys(manifest).length}/${creators.length} creator images`)
