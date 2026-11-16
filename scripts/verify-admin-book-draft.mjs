import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

try {
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    const draft = JSON.stringify({ updatedAt: Date.now(), values: { title: 'Kiểm thử giữ dữ liệu', isbn: '9781234567890', salePrice: '460000', author: ['Tác giả kiểm thử'] }, isVisible: true, homeModules: ['New & Upcoming'] })
    window.localStorage.setItem('linery-admin-book-draft-v2', draft)
    window.sessionStorage.setItem('linery-admin-book-draft-v2', draft)
  })
  await page.goto('http://localhost:5174/#home', { waitUntil: 'networkidle' })
  await page.goto('http://localhost:5174/admin/books/new', { waitUntil: 'networkidle' })
  const restoredDraft = await page.evaluate(() => JSON.parse(window.localStorage.getItem('linery-admin-book-draft-v2') ?? '{}'))
  const persisted = restoredDraft.values?.title === 'Kiểm thử giữ dữ liệu' && restoredDraft.values?.isbn === '9781234567890' && restoredDraft.values?.salePrice === '460000' && restoredDraft.values?.author?.[0] === 'Tác giả kiểm thử' && restoredDraft.homeModules?.[0] === 'New & Upcoming'
  console.log(JSON.stringify({ restoredDraft, persisted }))
  if (!persisted) process.exitCode = 1
} finally {
  await browser.close()
}
