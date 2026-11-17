import fs from 'node:fs/promises'
import path from 'node:path'

const apply = process.argv.includes('--apply')
const projectRoot = process.cwd()

const env = Object.fromEntries(
  (await fs.readFile(path.join(projectRoot, '.env.enhanced'), 'utf8'))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
    }),
)

const supabaseUrl = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY
const accessToken = process.env.SUPABASE_ACCESS_TOKEN
if (!supabaseUrl || !anonKey) throw new Error('Thiếu cấu hình Supabase trong .env.enhanced.')
if (apply && !accessToken) throw new Error('Chạy --apply cần biến môi trường SUPABASE_ACCESS_TOKEN; công cụ không đọc hoặc lưu mật khẩu.')

const readHeaders = { apikey: anonKey, Authorization: `Bearer ${accessToken || anonKey}` }
const writeHeaders = { ...readHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

async function readRows(table, select) {
  const url = new URL(`/rest/v1/${table}`, supabaseUrl)
  url.searchParams.set('select', select)
  url.searchParams.set('limit', '2000')
  const response = await fetch(url, { headers: readHeaders })
  if (!response.ok) throw new Error(`${table}: HTTP ${response.status} ${await response.text()}`)
  return response.json()
}

async function updateRow(table, id, field, value) {
  const url = new URL(`/rest/v1/${table}`, supabaseUrl)
  url.searchParams.set('id', `eq.${id}`)
  const response = await fetch(url, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ [field]: value }) })
  if (!response.ok) throw new Error(`${table}/${id}: HTTP ${response.status} ${await response.text()}`)
}

async function uploadStorage(objectPath, localPath) {
  const content = await fs.readFile(localPath)
  const contentType = objectPath.endsWith('.png') ? 'image/png'
    : objectPath.endsWith('.webp') ? 'image/webp'
      : objectPath.endsWith('.svg') ? 'image/svg+xml'
        : objectPath.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
  const url = `${supabaseUrl}/storage/v1/object/site-media/${objectPath.split('/').map(encodeURIComponent).join('/')}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...readHeaders, 'Content-Type': contentType, 'x-upsert': 'true' },
    body: content,
  })
  if (!response.ok && response.status !== 409) throw new Error(`Storage/${objectPath}: HTTP ${response.status} ${await response.text()}`)
}

async function uploadSample(objectPath, localPath) {
  const content = await fs.readFile(localPath)
  const url = `${supabaseUrl}/storage/v1/object/book-samples/${objectPath.split('/').map(encodeURIComponent).join('/')}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...readHeaders, 'Content-Type': 'application/pdf', 'x-upsert': 'true' },
    body: content,
  })
  if (!response.ok && response.status !== 409) throw new Error(`Storage/${objectPath}: HTTP ${response.status} ${await response.text()}`)
}

const plans = []
const skipped = []

function addPlan(table, row, field, bucket, sourcePath, targetPath, updateValue = targetPath) {
  if (!sourcePath?.startsWith('/assets/')) return
  if (sourcePath === '/assets/author-avatar-placeholder.png') {
    skipped.push(`${table}/${row.id}: ảnh mặc định, không chuyển thành ảnh thật`)
    return
  }
  const localPath = path.join(projectRoot, 'public', sourcePath.replace(/^\//, ''))
  plans.push({ table, id: row.id, field, bucket, sourcePath, targetPath, updateValue, localPath })
}

for (const row of await readRows('creator_images', 'id,storage_path')) {
  if (row.storage_path?.startsWith('/assets/creators/')) addPlan('creator_images', row, 'storage_path', 'site-media', row.storage_path, row.storage_path.slice('/assets/'.length))
  else if (row.storage_path === '/assets/author-avatar-placeholder.png') addPlan('creator_images', row, 'storage_path', 'site-media', row.storage_path, '')
}
for (const row of await readRows('news_posts', 'id,image_storage_path')) {
  addPlan('news_posts', row, 'image_storage_path', 'site-media', row.image_storage_path, `editorial/${row.image_storage_path?.slice('/assets/'.length) ?? ''}`)
}
for (const row of await readRows('news_post_blocks', 'id,image_storage_path')) {
  addPlan('news_post_blocks', row, 'image_storage_path', 'site-media', row.image_storage_path, `editorial/${row.image_storage_path?.slice('/assets/'.length) ?? ''}`)
}
for (const row of await readRows('site_media_assets', 'id,public_url')) {
  const targetPath = `site/${row.public_url?.slice('/assets/'.length) ?? ''}`
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/site-media/${targetPath.split('/').map(encodeURIComponent).join('/')}`
  addPlan('site_media_assets', row, 'public_url', 'site-media', row.public_url, targetPath, publicUrl)
}

for (const row of await readRows('books', 'id,sample_pdf_storage_path,sample_pdf_enabled')) {
  if (!row.sample_pdf_enabled || !row.sample_pdf_storage_path?.startsWith('/assets/')) continue
  const localPath = path.join(projectRoot, 'public', row.sample_pdf_storage_path.replace(/^\//, ''))
  const targetPath = `samples/${path.basename(row.sample_pdf_storage_path)}`
  plans.push({ table: 'books', id: row.id, field: 'sample_pdf_storage_path', bucket: 'book-samples', sourcePath: row.sample_pdf_storage_path, targetPath, updateValue: targetPath, localPath })
}

const missing = []
for (const plan of plans) {
  try { await fs.access(plan.localPath) } catch { missing.push(`${plan.table}/${plan.id}: ${plan.localPath}`) }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', planned: plans.length, missing: missing.length, skipped: skipped.length, missingFiles: missing, skippedRows: skipped }, null, 2))
if (missing.length) process.exitCode = 1
if (!apply || missing.length) process.exit()

for (const plan of plans) {
  if (plan.bucket === 'book-samples') await uploadSample(plan.targetPath, plan.localPath)
  else await uploadStorage(plan.targetPath, plan.localPath)
  await updateRow(plan.table, plan.id, plan.field, plan.updateValue)
}
console.log(`Đã tải ${plans.length} tệp lên Storage và cập nhật database.`)
