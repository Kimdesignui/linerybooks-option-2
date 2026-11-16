import fs from 'node:fs'
import path from 'node:path'
import readXlsxFile from 'read-excel-file/node'

const workbookPath = process.argv[2] ?? 'C:/Users/kimtieuke/AppData/Local/Temp/linery-books-source.xlsx'

if (!fs.existsSync(workbookPath)) {
  console.error(`Không tìm thấy workbook nguồn: ${workbookPath}`)
  process.exit(1)
}

const workbook = await readXlsxFile(workbookPath)
const imagePattern = /\.(?:avif|gif|jpe?g|png|webp)(?:[?#].*)?$/i
const rows = []

for (const sheet of workbook) {
  const [header = [], ...data] = sheet.data ?? []
  const isbnIndex = header.findIndex((value) => String(value ?? '').trim().toLowerCase() === 'isbn')
  const linkIndex = header.findIndex((value) => String(value ?? '').trim().toLowerCase() === 'link')
  const titleIndex = header.findIndex((value) => String(value ?? '').trim() === 'Tác phẩm')
  if (isbnIndex < 0 || linkIndex < 0) continue

  for (const row of data) {
    const isbn = String(row[isbnIndex] ?? '').replace(/\D/g, '')
    const link = String(row[linkIndex] ?? '').trim()
    const title = String(row[titleIndex] ?? '').trim()
    if (!isbn || !link || !/^\d{10,14}$/.test(isbn)) continue
    rows.push({ sheet: sheet.name, isbn, title, link, looksLikeImageUrl: imagePattern.test(link) })
  }
}

const unique = [...new Map(rows.map((row) => [row.isbn, row])).values()]
const imageLinks = unique.filter((row) => row.looksLikeImageUrl)
const productPageLinks = unique.filter((row) => !row.looksLikeImageUrl)

console.log(JSON.stringify({
  workbook: path.resolve(workbookPath),
  rows: unique.length,
  imageUrlRows: imageLinks.length,
  productPageUrlRows: productPageLinks.length,
  sampleProductPageLinks: productPageLinks.slice(0, 5),
}, null, 2))

if (imageLinks.length === 0 && productPageLinks.length > 0) {
  console.error('Cột Link chỉ chứa URL trang sản phẩm; cần bước tải/scrape ảnh trước khi ghi vào Supabase Storage.')
}
