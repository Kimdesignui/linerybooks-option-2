import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:5174'
const routes = [
  '/',
  '/all-books',
  '/creators',
  '/news',
  '/books/a-manual-for-cleaning-women',
  '/books/a-manual-for-cleaning-women/reader',
  '/admin',
  '/admin/news',
  '/admin/settings/admin-users',
]
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch({ headless: true })
const failures = []

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
  const page = await context.newPage()
  const pageErrors = []
  const consoleErrors = []
  const failedResponses = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`)
  })

  for (const route of routes) {
    try {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForTimeout(700)
      if (route.endsWith('/reader')) {
        await page.waitForFunction(() => document.body.innerText.includes('Read aloud'), undefined, { timeout: 6000 }).catch(() => undefined)
      }
      const state = await page.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        hasRoot: Boolean(document.querySelector('#root')),
        bodyText: document.body.innerText.trim(),
      }))
      if (!response || response.status() >= 400) failures.push(`${viewport.name} ${route}: HTTP ${response?.status() ?? 'no response'}`)
      if (!state.hasRoot || !state.bodyText) failures.push(`${viewport.name} ${route}: blank application shell`)
      if (state.horizontalOverflow) failures.push(`${viewport.name} ${route}: horizontal overflow`)
      if (route.startsWith('/admin') && !state.bodyText.includes('Đăng nhập quản trị')) failures.push(`${viewport.name} ${route}: unauthenticated admin gate missing`)
      if (route.endsWith('/reader') && (!state.bodyText.includes('Read aloud') || !state.bodyText.includes('PDF reading sample'))) failures.push(`${viewport.name} ${route}: reader controls or metadata missing`)
    } catch (error) {
      failures.push(`${viewport.name} ${route}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  try {
    const sampleResponse = await context.request.get(`${baseUrl}/assets/book-samples/a-manual-for-cleaning-women.pdf`)
    const contentType = sampleResponse.headers()['content-type'] ?? ''
    if (sampleResponse.status() >= 400 || !contentType.includes('application/pdf')) failures.push(`${viewport.name}: reading sample PDF is unavailable or has the wrong content type`)
  } catch (error) {
    failures.push(`${viewport.name}: reading sample request failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (pageErrors.length) failures.push(`${viewport.name}: page errors: ${pageErrors.join(' | ')}`)
  if (consoleErrors.length) failures.push(`${viewport.name}: console errors: ${consoleErrors.join(' | ')}`)
  if (failedResponses.length) failures.push(`${viewport.name}: failed responses: ${failedResponses.join(' | ')}`)
  await context.close()
}

await browser.close()
if (failures.length) {
  console.error(`QA FAILED (${failures.length})`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log(`QA PASS: ${routes.length} routes x ${viewports.length} viewports; no shell, runtime, console, or horizontal-overflow failures.`)
