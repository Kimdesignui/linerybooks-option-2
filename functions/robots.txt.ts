export async function onRequestGet({ request }: { request: Request }) {
  const origin = new URL(request.url).origin
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /reset-password\nDisallow: /account\nDisallow: /search\n\nSitemap: ${origin}/sitemap.xml\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=900' } })
}
