import { mediaUrl, supabase } from '../lib/supabase'
import { parseVideo } from '../lib/video'

/** Delete a video row and its uploaded cover (if any). */
export async function deleteVideo(video) {
  if (video.cover_path && !video.cover_path.startsWith('/')) {
    await supabase.storage.from('media').remove([video.cover_path])
  }
  const { error } = await supabase.from('videos').delete().eq('id', video.id)
  if (error) throw error
}

/** Best thumbnail for the admin list: uploaded cover, else the YouTube still. */
export function thumbFor(video) {
  if (video.cover_path) return mediaUrl(video.cover_path)
  return parseVideo(video.url)?.thumb ?? null
}

export const CATEGORY_SUGGESTIONS = [
  'Music Video',
  'Brand Film',
  'YouTube Long-Form',
  'Documentary',
  'Commercial',
  'Podcast',
  'Wedding Film',
  'Instagram Reel',
  'YouTube Short',
  'Motion Graphics',
]
