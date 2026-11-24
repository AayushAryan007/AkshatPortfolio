import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** True when Supabase is configured. Without it the site runs on the defaults in data/content.js. */
export const hasSupabase = Boolean(url && key)

/**
 * One browser client for the whole app. Visitors read as `anon`; the admin
 * signs in with email + password. Row Level Security decides what each can do.
 */
export const supabase = hasSupabase ? createClient(url, key) : null

/**
 * Resolve a stored media path to a URL.
 * Paths starting with "/" are bundled files in /public; "http" is used as-is;
 * anything else is a key in the Supabase "media" storage bucket.
 */
export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('/') || path.startsWith('http')) return path
  return `${url}/storage/v1/object/public/media/${path}`
}
