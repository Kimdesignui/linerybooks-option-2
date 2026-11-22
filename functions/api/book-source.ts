type BookSourceRequest = { url?: string }

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})

const parseUrl = (value: string) => {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Chỉ hỗ trợ URL http hoặc https.')
  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname === '::1' || /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) || hostname.endsWith('.local')) throw new Error('URL nguồn không được trỏ vào máy nội bộ.')
  return url
}

const attributeValue = (tag: string, attribute: string) => new RegExp(`${attribute}=["']([^"']+)["']`, 'i').exec(tag)?.[1] ?? ''
const decodeHtml = (value: string) => value.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&nbsp;/gi, ' ')

const productImageUrl = (html: string, sourceUrl: URL) => {
  const linkedImages = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]{0,1200}?<img\b[^>]*>/gi)].map((match) => decodeHtml(match[1])).filter(Boolean)
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => {
    const tag = match[0]
    const zoomSource = attributeValue(tag, 'data-zoom') || attributeValue(tag, 'data-full') || attributeValue(tag, 'data-image') || attributeValue(tag, 'data-original')
    const source = zoomSource || attributeValue(tag, 'data-src') || attributeValue(tag, 'data-lazy-src') || attributeValue(tag, 'src')
    const srcset = attributeValue(tag, 'srcset') || attributeValue(tag, 'data-srcset')
    const largestSrcset = srcset.split(',').map((item) => item.trim().split(/\s+/)[0]).filter(Boolean).pop() ?? ''
    const imageUrl = decodeHtml(source || largestSrcset)
    if (!imageUrl) return null
    if (/^(data|blob):/i.test(imageUrl)) return null
    const context = `${attributeValue(tag, 'class')} ${attributeValue(tag, 'id')} ${attributeValue(tag, 'alt')} ${attributeValue(tag, 'data-testid')}`.toLowerCase()
    if (/\.(?:svg|gif)(?:[?#]|$)/i.test(imageUrl) || /(logo|icon|avatar|banner)/.test(context)) return null
    const linkedSource = linkedImages.find((candidate) => candidate.includes(imageUrl) || imageUrl.includes(candidate))
    const smallVariant = /(?:[?&](?:width|w|size)=\d{1,3}\b|[_-](?:thumb|thumbnail|small|sm)(?:[._-]|$))/i.test(imageUrl)
    const socialVariant = /(og[-_]?image|open[-_]?graph|social[-_]?image|share[-_]?image|twitter[-_]?card)/i.test(`${context} ${imageUrl}`)
    const score = (zoomSource ? 30 : 0) + (linkedSource ? 22 : 0) + (/(product|book|cover|detail|gallery|main)/.test(context) ? 10 : 0) - (smallVariant ? 18 : 0) - (socialVariant ? 40 : 0) - (/(logo|icon|avatar|banner|thumb|thumbnail)/.test(context) ? 12 : 0)
    return { imageUrl, score }
  }).filter((item): item is { imageUrl: string; score: number } => Boolean(item))
  const linkedImageCandidates = linkedImages.filter((imageUrl) => !/^(data|blob):/i.test(imageUrl) && !/\.(?:svg|gif)(?:[?#]|$)/i.test(imageUrl) && !/\/tif(?:[/?#]|$)/i.test(imageUrl) && (/(?:\.(?:jpe?g|png|webp|avif))(?:[?#]|$)/i.test(imageUrl) || /\/(?:cover|image|gallery)(?:[/?#]|$)/i.test(imageUrl))).map((imageUrl) => ({ imageUrl, score: 28 }))
  images.push(...linkedImageCandidates)
  images.sort((left, right) => right.score - left.score)
  const candidate = images[0]?.imageUrl
  return candidate ? new URL(candidate, sourceUrl).toString() : ''
}

const pageTitle = (html: string) => decodeHtml(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] || /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const descriptionText = (html: string) => decodeHtml(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html)?.[1] || '').trim()
const stripHtml = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, ' ').trim()

export async function onRequestPost({ request }: { request: Request }) {
  let input: BookSourceRequest
  try { input = await request.json() as BookSourceRequest } catch { return json({ error: 'Dữ liệu URL không hợp lệ.' }, 400) }
  if (!input.url?.trim()) return json({ error: 'Chưa nhập URL nguồn.' }, 400)
  try {
    const sourceUrl = parseUrl(input.url.trim())
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(sourceUrl, { signal: controller.signal, headers: { 'User-Agent': 'LineryBooks-AI-Importer/1.0' } })
    clearTimeout(timeout)
    if (!response.ok) return json({ error: `Không đọc được URL nguồn (HTTP ${response.status}).` }, 502)
    const html = await response.text()
    const coverUrl = productImageUrl(html, sourceUrl)
    const title = pageTitle(html)
    const description = descriptionText(html)
    return json({ sourceUrl: sourceUrl.toString(), title, description, coverUrl, text: stripHtml(html).slice(0, 120000) })
  } catch (reason) {
    return json({ error: reason instanceof Error ? reason.message : 'Không đọc được URL nguồn.' }, 400)
  }
}
