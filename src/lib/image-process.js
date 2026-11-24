/**
 * Browser-side image processing for admin uploads.
 * Each picture becomes two compressed files: a 1600px "full" image and an
 * 800px thumbnail. WebP where the browser can encode it, JPEG otherwise.
 */

async function encode(canvas, quality) {
  const webp = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp' }
  const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!jpeg) throw new Error('This browser could not process the image.')
  return { blob: jpeg, ext: 'jpg' }
}

function draw(source, maxEdge) {
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(source.width * scale)
  canvas.height = Math.round(source.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

export async function processImage(file, { full = 1600, thumb = 800 } = {}) {
  // imageOrientation honours the EXIF rotation from phone cameras.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const fullCanvas = draw(bitmap, full)
  const thumbCanvas = draw(bitmap, thumb)
  bitmap.close()
  const [f, t] = await Promise.all([encode(fullCanvas, 0.82), encode(thumbCanvas, 0.78)])
  return { full: f.blob, thumb: t.blob, width: fullCanvas.width, height: fullCanvas.height, ext: f.ext }
}

export const MAX_INPUT_BYTES = 15 * 1024 * 1024
