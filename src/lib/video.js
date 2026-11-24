// Turns a pasted YouTube / Instagram link into everything the site needs to
// show a thumbnail and play it inline.

export function parseVideo(url = '') {
  const u = url.trim()
  if (!u) return null

  // YouTube: watch?v=, youtu.be/, shorts/, embed/, live/
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  if (yt) {
    const id = yt[1]
    const isShort = /\/shorts\//.test(u)
    return {
      platform: 'youtube',
      id,
      vertical: isShort,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      thumbHi: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      link: u,
    }
  }

  // Instagram: /reel/, /reels/, /p/, /tv/
  const ig = u.match(/instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)
  if (ig) {
    const kind = ig[1] === 'reels' ? 'reel' : ig[1]
    const id = ig[2]
    return {
      platform: 'instagram',
      id,
      vertical: true,
      thumb: null, // Instagram blocks hot-linked thumbnails; admin will allow a custom cover upload
      embed: `https://www.instagram.com/${kind}/${id}/embed/`,
      link: u,
    }
  }

  return null
}
