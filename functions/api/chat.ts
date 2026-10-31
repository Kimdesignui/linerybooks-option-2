type ChatRequest = {
  message?: string
  image?: {
    mimeType?: string
    data?: string
  }
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: { message?: string }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})

export async function onRequestPost({ request, env }: { request: Request; env: { GEMINI_API_KEY?: string } }) {
  if (!env.GEMINI_API_KEY) return json({ error: 'Gemini is not configured.' }, 503)

  let input: ChatRequest
  try {
    input = await request.json() as ChatRequest
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const message = input.message?.trim() || 'Identify this book cover and check whether the book is available online.'
  const parts: Array<Record<string, unknown>> = [{
    text: `You are Linery Assistant, a helpful bookstore support agent. Answer in the user’s language. If an image is provided, identify the book cover as accurately as possible. Do not claim that you verified online availability unless the user provides a link or the search tool is available. Do not invent a match; clearly say when the image is inconclusive. User request: ${message}`,
  }]

  if (input.image?.data && input.image.mimeType?.startsWith('image/')) {
    parts.push({ inline_data: { mime_type: input.image.mimeType, data: input.image.data } })
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts }] }),
  })

  const result = await response.json() as GeminiResponse
  if (!response.ok) return json({ error: result.error?.message || 'Gemini request failed.' }, response.status)

  const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim()
  return json({ text: text || 'I could not find a clear answer for that request.' })
}
