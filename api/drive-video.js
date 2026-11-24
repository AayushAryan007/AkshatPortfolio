// Streams a Google Drive video through this site so it can play in a normal <video> tag.
// Drive refuses to serve the raw file to other websites (it rejects cross-site requests),
// so the browser can't load it directly; this function fetches it server-side instead.
//
// Only files linked from a published video (or the showreel) are served, so this can't be
// used as an open proxy. Responses are cut into ≤4 MB ranges to stay under Vercel's
// response size limit; video players simply ask for the next range.

const CHUNK = 4 * 1024 * 1024
const ID_RE = /^[A-Za-z0-9_-]{10,100}$/
const ALLOW_TTL = 10 * 60 * 1000
const allowCache = new Map() // id -> { ok, until }

async function isAllowed(id) {
  const hit = allowCache.get(id)
  if (hit && hit.until > Date.now()) return hit.ok

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return false
  const headers = { apikey: key, Authorization: `Bearer ${key}` }

  // `id` is already restricted to [A-Za-z0-9_-], so it is safe inside the filter.
  const [videos, showreel] = await Promise.all([
    fetch(`${url}/rest/v1/videos?select=id&is_published=eq.true&url=ilike.*${id}*&limit=1`, { headers }).then((r) => (r.ok ? r.json() : [])),
    fetch(`${url}/rest/v1/site_content?select=value&key=eq.showreel`, { headers }).then((r) => (r.ok ? r.json() : [])),
  ]).catch(() => [[], []])

  const ok = videos.length > 0 || JSON.stringify(showreel).includes(id)
  allowCache.set(id, { ok, until: Date.now() + ALLOW_TTL })
  return ok
}

function parseRange(header) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header || '')
  const start = m && m[1] ? Number(m[1]) : 0
  const askedEnd = m && m[2] ? Number(m[2]) : Infinity
  return { start, end: Math.min(askedEnd, start + CHUNK - 1) }
}

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('id') || ''
  if (!ID_RE.test(id)) return new Response('Bad id', { status: 400 })
  if (!(await isAllowed(id))) return new Response('Not found', { status: 404 })

  const { start, end } = parseRange(request.headers.get('range'))
  const upstream = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`, {
    headers: { Range: `bytes=${start}-${end}` },
    redirect: 'follow',
  })

  const type = upstream.headers.get('content-type') || ''
  // `confirm=t` skips Drive's "too large to scan for viruses" page (files over ~100 MB).
  // If Drive still answers with a web page (quota, permissions), let the player fall back.
  if (!(upstream.status === 206 || upstream.status === 200) || type.startsWith('text/html')) {
    upstream.body?.cancel()
    return new Response('Unavailable', { status: 502 })
  }

  const headers = new Headers({
    'Content-Type': type || 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=3600',
    'X-Robots-Tag': 'noindex',
  })
  for (const h of ['content-range', 'content-length']) {
    const v = upstream.headers.get(h)
    if (v) headers.set(h, v)
  }
  return new Response(upstream.body, { status: upstream.status, headers })
}
