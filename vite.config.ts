import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const localPagesFunctions = (): Plugin => ({
  name: 'linery-local-pages-functions',
  configureServer(server) {
    server.middlewares.use(async (nodeRequest, nodeResponse, next) => {
      const pathname = new URL(nodeRequest.url ?? '/', 'http://localhost').pathname
      const route = pathname === '/api/book-source' ? './functions/api/book-source.ts'
        : pathname === '/api/chat' ? './functions/api/chat.ts'
          : pathname === '/api/fetch-cover' ? './functions/api/fetch-cover.ts' : ''
      if (!route) { next(); return }

      try {
        const chunks: Buffer[] = []
        if (nodeRequest.method !== 'GET' && nodeRequest.method !== 'HEAD') {
          for await (const chunk of nodeRequest) chunks.push(Buffer.from(chunk))
        }
        const requestUrl = new URL(nodeRequest.url ?? '/', 'http://localhost:5176')
        const request = new Request(requestUrl, {
          method: nodeRequest.method,
          headers: nodeRequest.headers as Record<string, string>,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        })
        const module = await server.ssrLoadModule(route) as {
          onRequestGet?: (context: { request: Request }) => Promise<Response>
          onRequestPost?: (context: { request: Request; env?: Record<string, unknown> }) => Promise<Response>
        }
        const handler = nodeRequest.method === 'GET' ? module.onRequestGet : module.onRequestPost
        if (!handler) { nodeResponse.statusCode = 405; nodeResponse.end('Method Not Allowed'); return }
        const response = await handler({ request, env: { GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '' } })
        nodeResponse.statusCode = response.status
        response.headers.forEach((value, key) => nodeResponse.setHeader(key, value))
        nodeResponse.end(Buffer.from(await response.arrayBuffer()))
      } catch (error) {
        nodeResponse.statusCode = 500
        nodeResponse.setHeader('Content-Type', 'application/json; charset=utf-8')
        nodeResponse.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Local API error.' }))
      }
    })
  },
})

export default defineConfig({
  plugins: [localPagesFunctions(), react(), tailwindcss()],
})
