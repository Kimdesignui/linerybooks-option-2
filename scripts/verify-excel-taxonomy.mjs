import fs from 'node:fs'
import path from 'node:path'
import readXlsxFile from 'read-excel-file/node'

const projectRoot = process.cwd()
const envPath = path.join(projectRoot, '.env.enhanced')
const workbookPath = path.join(projectRoot, '..', 'linery-books-google.xlsx')

const readEnv = () => {
  const values = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) values[match[1].trim()] = match[2].trim()
  }
  return values
}

const env = readEnv()
const supabaseUrl = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY
if (!supabaseUrl || !anonKey) throw new Error('Thiếu cấu hình Supabase trong .env.enhanced.')
if (!fs.existsSync(workbookPath)) throw new Error(`Không tìm thấy workbook nguồn: ${workbookPath}`)

const sourceByKind = new Map([
  ['format', new Set()],
  ['line', new Set()],
  ['genre', new Set()],
])
const columnKinds = new Map([
  ['Thể thức', 'format'],
  ['Dòng sách', 'line'],
  ['Thể loại', 'genre'],
])

for (const sheet of ['Picador', 'Penguin UK', 'Penguin US', 'NYRB']) {
  const sheetResult = await readXlsxFile(workbookPath, { sheet })
  const selectedSheet = Array.isArray(sheetResult) && sheetResult[0]?.sheet ? sheetResult.find((item) => item.sheet === sheet) : sheetResult
  const rows = selectedSheet?.data ?? selectedSheet
  const headers = (rows[0] ?? []).map((value) => String(value ?? '').trim())
  const indexes = [...columnKinds.entries()]
    .map(([column, kind]) => [headers.indexOf(column), kind])
    .filter(([index]) => index >= 0)
  for (const row of rows.slice(1)) {
    for (const [index, kind] of indexes) {
      const value = String(row[index] ?? '').trim()
      if (value) sourceByKind.get(kind).add(value)
    }
  }
}

const response = await fetch(`${supabaseUrl}/rest/v1/taxonomy_terms?select=kind,name&limit=1000`, {
  headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
})
if (!response.ok) throw new Error(`Không đọc được taxonomy_terms từ Supabase: HTTP ${response.status}`)
const remoteRows = await response.json()
const remoteByKind = new Map()
for (const row of remoteRows) {
  const values = remoteByKind.get(row.kind) ?? new Set()
  values.add(String(row.name ?? '').trim().toLocaleLowerCase('vi'))
  remoteByKind.set(row.kind, values)
}

const missing = []
for (const [kind, values] of sourceByKind) {
  const remoteValues = remoteByKind.get(kind) ?? new Set()
  for (const value of values) {
    if (!remoteValues.has(value.toLocaleLowerCase('vi'))) missing.push(`${kind}: ${value}`)
  }
}

console.log(`Excel taxonomy source: ${[...sourceByKind.values()].reduce((total, values) => total + values.size, 0)} giá trị duy nhất.`)
if (missing.length) {
  console.error(`Thiếu ${missing.length} giá trị trong Supabase:`)
  for (const value of missing) console.error(`- ${value}`)
  process.exitCode = 1
} else {
  console.log('Excel taxonomy và Supabase đã khớp.')
}
