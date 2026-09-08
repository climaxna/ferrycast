// Keep Next's persistent fetch cache; share only in-flight GETs in this instance.
// Buffer the body inside the deadline: a connection can fail after headers arrive.
type Options = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }
type Result = { body: string; status: number; statusText: string; headers: Headers }
const pending = new Map<string, Promise<Result>>()

export async function fetchPublicData(url: string, options: Options = {}): Promise<Response> {
  const key = JSON.stringify([url, options])
  let request = pending.get(key)
  if (!request) {
    request = (async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8_000)
      try {
        const response = await fetch(url, { ...options, signal: controller.signal })
        const body = await response.text()
        return { body, status: response.status, statusText: response.statusText, headers: response.headers }
      } finally {
        clearTimeout(timer)
      }
    })()
    pending.set(key, request)
  }
  try {
    const result = await request
    return new Response([204, 205, 304].includes(result.status) ? null : result.body, result)
  } finally {
    if (pending.get(key) === request) pending.delete(key)
  }
}
