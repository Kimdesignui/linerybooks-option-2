const parseUrl = (value: string) => {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Chỉ hỗ trợ URL ảnh http hoặc https.')
  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname === '::1' || /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) || hostname.endsWith('.local')) throw new Error('URL ảnh không được trỏ vào máy nội bộ.')
  return url
}

export async function onRequestGet({ request }: { request: Request }) {
  const rawUrl = new URL(request.url).searchParams.get('url')
  if (!rawUrl) return new Response('Thiếu URL ảnh.', { status: 400 })
  try {
    const sourceUrl = parseUrl(rawUrl)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(sourceUrl, { signal: controller.signal, headers: { 'User-Agent': 'LineryBooks-AI-Importer/1.0' } })
    clearTimeout(timeout)
    if (!response.ok) return new Response(`Không tải được ảnh (HTTP ${response.status}).`, { status: 502 })
    const contentType = response.headers.get('content-type')?.split(';')[0].toLowerCase() ?? ''
    if (!contentType.startsWith('image/')) return new Response('URL nguồn không trả về tệp ảnh.', { status: 415 })
    const data = await response.arrayBuffer()
    if (data.byteLength > 8 * 1024 * 1024) return new Response('Ảnh bìa vượt quá giới hạn 8MB.', { status: 413 })
    const extension = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const safeName = decodeURIComponent(sourceUrl.pathname.split('/').pop() || `ai-cover.${extension}`).replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `ai-cover.${extension}`
    return new Response(data, { headers: { 'Content-Type': contentType, 'Content-Disposition': `attachment; filename="${safeName.includes('.') ? safeName : `${safeName}.${extension}`}"`, 'Cache-Control': 'no-store' } })
  } catch (reason) {
    return new Response(reason instanceof Error ? reason.message : 'Không tải được ảnh bìa.', { status: 400 })
  }
}
