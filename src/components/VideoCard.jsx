import { useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { parseVideo } from '../lib/video'
import { useVideoModal } from './VideoModal'
import { Arrow, Play } from './Icons'

// A thumbnail "monitor": hover tilts it in 3D, sweeps a scan line and shows
// a playback HUD. Clicking opens the inline player.
export default function VideoCard({ item, index, vertical = false, size = 'md', className = '' }) {
  const open = useVideoModal()
  const frame = useRef(null)
  const info = parseVideo(item.url)
  const [broken, setBroken] = useState(false)
  // Drive thumbnails can be blocked for some files — fall back to the styled placeholder.
  const thumb = broken ? null : item.cover || info?.thumb

  const onMove = (e) => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const r = frame.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(frame.current, { rotateY: x * 8, rotateX: -y * 8, duration: 0.6, ease: 'power3.out' })
    gsap.to(frame.current.querySelector('.vc-img'), { x: -x * 18, y: -y * 18, duration: 0.8, ease: 'power3.out' })
  }
  const onLeave = () => {
    gsap.to(frame.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
    gsap.to(frame.current.querySelector('.vc-img'), { x: 0, y: 0, duration: 0.8 })
  }

  const num = String(index + 1).padStart(2, '0')

  return (
    <article className={`vc group ${className}`} style={{ perspective: '1200px' }}>
      <button
        type="button"
        onClick={() => open(item)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-cursor="play"
        className="block w-full text-left"
        aria-label={`Play ${item.title}`}
      >
        <div
          ref={frame}
          className={`relative overflow-hidden rounded-[6px] border border-line bg-coal ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              onError={() => setBroken(true)}
              className="vc-img absolute -inset-[6%] h-[112%] w-[112%] object-cover transition-[filter,transform] duration-700 [filter:grayscale(0.35)_brightness(0.75)] group-hover:[filter:grayscale(0)_brightness(0.95)]"
            />
          ) : (
            <div className="vc-img no-signal absolute -inset-[6%]">
              <Placeholder vertical={vertical} title={item.title} />
            </div>
          )}

          {/* gradient + scan line */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 -translate-y-full bg-gradient-to-b from-transparent via-blood/25 to-transparent opacity-0 vc-scan" />

          {/* HUD */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rec-dot h-1.5 w-1.5 rounded-full bg-blood opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="mono text-[10px] tracking-[0.15em] text-white/70">
              {info ? (info.platform === 'drive' ? 'DRIVE' : info.platform.toUpperCase()) : 'PLACEHOLDER'}
            </span>
          </div>
          <span className="mono absolute right-3 top-3 text-[10px] tracking-[0.15em] text-white/50">
            {vertical ? '9:16' : '16:9'}
          </span>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 scale-75 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:scale-100 group-hover:border-blood group-hover:bg-blood group-hover:opacity-100 sm:h-16 sm:w-16">
              <Play className="ml-0.5 h-5 w-5" />
            </span>
          </div>

          {/* progress bar */}
          <div className="absolute inset-x-3 bottom-3 h-[2px] overflow-hidden bg-white/15">
            <div className="h-full w-0 bg-blood transition-[width] duration-[1.6s] ease-out group-hover:w-full" />
          </div>
        </div>

        {/* caption */}
        {!vertical ? (
          <div className="mt-4 flex items-center gap-4 sm:gap-5">
            <span className={`display text-blood ${size === 'lg' ? 'text-5xl' : 'text-4xl'}`}>{num}</span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-semibold uppercase tracking-wide">{item.title}</h3>
              <p className="label mt-1 truncate text-mute">
                {item.category}{item.client ? ` · ${item.client}` : ''}
              </p>
            </div>
            <Arrow className="h-6 w-6 shrink-0 text-white/70 transition-transform duration-500 group-hover:translate-x-1.5 group-hover:text-blood" />
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-2">
            <h3 className="truncate text-[13px] font-semibold uppercase tracking-wide">{item.title}</h3>
            <span className="label shrink-0 text-[10px] text-mute">{item.category}</span>
          </div>
        )}
      </button>
    </article>
  )
}

function Placeholder({ vertical, title }) {
  return (
    <div className="absolute inset-[6%] flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex gap-1 opacity-60">
        {Array.from({ length: vertical ? 5 : 9 }).map((_, i) => (
          <span key={i} className="w-[3px] rounded-full bg-white/40" style={{ height: 8 + ((i * 37) % 26) }} />
        ))}
      </div>
      <span className="display text-outline text-3xl sm:text-4xl">{title}</span>
      <span className="mono text-[10px] tracking-[0.2em] text-white/40">ADD VIDEO LINK</span>
    </div>
  )
}
