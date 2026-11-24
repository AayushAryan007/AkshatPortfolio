/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import * as defaults from '../data/content'
import { hasSupabase, mediaUrl, supabase } from './supabase'

// Section keys as stored in the site_content table, mapped to their default export.
export const CONTENT_KEYS = {
  profile: 'profile',
  stats: 'stats',
  marquee: 'marquee',
  showreel: 'showreel',
  education: 'education',
  skills: 'skills',
  process: 'process',
  quote: 'quote',
  contact: 'contact',
  socials: 'socials',
}

const CACHE_KEY = 'ak-content-v1'

/** Stored values over defaults: objects merge field by field, non-empty arrays and strings replace. */
export function mergeContent(rows) {
  const stored = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]))
  const out = { ...defaults }
  for (const [key, name] of Object.entries(CONTENT_KEYS)) {
    const def = defaults[name]
    const val = stored[key]
    if (val == null) continue
    if (Array.isArray(def)) out[name] = Array.isArray(val) && val.length ? val : def
    else if (typeof def === 'object') out[name] = { ...def, ...val }
    else if (typeof val === typeof def && val !== '') out[name] = val
  }
  return out
}

/** DB rows → the shape the site components use (same as data/content.js). */
export function toSiteVideo(v) {
  return {
    id: v.id,
    title: v.title,
    category: v.category || '',
    client: v.client || '',
    year: v.year || '',
    url: v.url,
    format: v.format,
    cover: v.cover_path ? mediaUrl(v.cover_path) : null,
  }
}

/**
 * Videos shown on the site. Each format (landscape / vertical) falls back to the
 * built-in placeholders until at least one real video of that format is published,
 * so the layout never collapses while the portfolio is being filled in.
 */
function mergeVideos(rows) {
  if (!rows) return defaults.videos
  const real = rows.map(toSiteVideo)
  const isVert = (v) => v.format === 'vertical'
  const landscape = real.filter((v) => !isVert(v))
  const vertical = real.filter(isVert)
  return [
    ...(landscape.length ? landscape : defaults.videos.filter((v) => v.format !== 'vertical')),
    ...(vertical.length ? vertical : defaults.videos.filter((v) => v.format === 'vertical')),
  ]
}

function build(cache) {
  const content = mergeContent(cache?.content)
  content.videos = mergeVideos(cache?.videos)
  content.profile = { ...content.profile, photo: mediaUrl(content.profile.photo) }
  return content
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or blocked: the site still works, it just refetches.
  }
}

export async function fetchContentRows() {
  const { data, error } = await supabase.from('site_content').select('key, value, updated_at')
  if (error) throw error
  return data
}

export async function fetchPublishedVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

const ContentContext = createContext(build(null))

/**
 * Loads editable copy + videos once per visit. Returning visitors render instantly
 * from the last cached copy while a fresh one loads; first-time visitors wait for
 * the request (up to 2.5 s) so the page never flashes placeholder text.
 */
export function ContentProvider({ children }) {
  const [state, setState] = useState(() => {
    if (!hasSupabase) return { ready: true, content: build(null) }
    const cached = readCache()
    return cached ? { ready: true, content: build(cached) } : { ready: false, content: build(null) }
  })

  useEffect(() => {
    if (!hasSupabase) return
    let alive = true
    const timer = setTimeout(() => alive && setState((s) => (s.ready ? s : { ...s, ready: true })), 2500)
    Promise.all([fetchContentRows(), fetchPublishedVideos()])
      .then(([content, videos]) => {
        if (!alive) return
        const data = { content, videos }
        writeCache(data)
        setState({ ready: true, content: build(data) })
      })
      .catch(() => alive && setState((s) => ({ ...s, ready: true })))
      .finally(() => clearTimeout(timer))
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [])

  if (!state.ready) return <div className="min-h-dvh bg-ink" aria-busy="true" />
  return <ContentContext.Provider value={state.content}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext)

/** Lets the admin panel drop the visitor cache after saving, so their own preview is fresh. */
export function clearContentCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}
