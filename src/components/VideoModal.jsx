import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { gsap, getLenis } from '../lib/motion'
import { parseVideo } from '../lib/video'
import { Close, ArrowUpRight } from './Icons'

const Ctx = createContext(() => {})
export const useVideoModal = () => useContext(Ctx)

export function VideoModalProvider({ children }) {
  const [item, setItem] = useState(null)
  const open = useCallback((v) => setItem(v), [])
  return (
    <Ctx.Provider value={open}>
      {children}
      {item && <Modal item={item} onClose={() => setItem(null)} />}
    </Ctx.Provider>
  )
}

// The frame is as large as fits the screen in either orientation; 9rem is kept free
// for the title bar and the "Open on" link.
const FIT = {
  landscape: { aspectRatio: '16 / 9', width: 'min(100%, 72rem, calc((100svh - 9rem) * 16 / 9))' },
  vertical: { aspectRatio: '9 / 16', width: 'min(100%, calc((100svh - 9rem) * 9 / 16))' },
}

function Modal({ item, onClose }) {
  const root = useRef(null)
  const frame = useRef(null)
  const info = parseVideo(item.url)
  const vertical = item.format ? item.format === 'vertical' : info?.vertical
  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    gsap.to(root.current, { opacity: 0, duration: 0.35, onComplete: onClose })
    gsap.to(frame.current, { scale: 0.94, duration: 0.35, ease: 'power2.in' })
  }, [onClose])

  // Full screen, turned to match the video where the phone allows it (Android).
  // iPhones don't support this for embeds; there the player's own full-screen button rotates.
  const fullscreen = useCallback(async () => {
    try {
      await frame.current.requestFullscreen({ navigationUI: 'hide' })
      await screen.orientation?.lock?.(vertical ? 'portrait' : 'landscape')
    } catch {
      /* rotation lock not supported: the video still fills the screen */
    }
  }, [vertical])

  useEffect(() => {
    const lenis = getLenis()
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
    // clearProps: a leftover clip-path around an iframe breaks embedded players on iOS.
    gsap.fromTo(frame.current, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.8, ease: 'expo.out', delay: 0.1, clearProps: 'clipPath' })
    const key = (e) => e.key === 'Escape' && !document.fullscreenElement && close()
    const unlock = () => !document.fullscreenElement && screen.orientation?.unlock?.()
    window.addEventListener('keydown', key)
    document.addEventListener('fullscreenchange', unlock)
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
      window.removeEventListener('keydown', key)
      document.removeEventListener('fullscreenchange', unlock)
      screen.orientation?.unlock?.()
    }
  }, [close])

  return (
    <div ref={root} className="fixed inset-0 z-[95] flex flex-col" onClick={close} role="dialog" aria-modal="true" aria-label={item.title}>
      {/* Backdrop on its own layer: a backdrop-filter on the player's parent darkens embeds on iOS. */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" aria-hidden="true" />

      <div className="relative flex shrink-0 items-center justify-between gap-4 px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
        <div className="min-w-0">
          <p className="label text-blood">{item.category}</p>
          <p className="display truncate text-2xl sm:text-3xl">{item.title}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {canFullscreen && info && (
            <button onClick={(e) => { e.stopPropagation(); fullscreen() }} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-blood hover:bg-blood" aria-label="Full screen">
              <FullscreenIcon />
            </button>
          )}
          <button onClick={close} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-blood hover:bg-blood" aria-label="Close video">
            <Close />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-10">
      <div
        ref={frame}
        className="relative bg-black"
        style={vertical ? FIT.vertical : FIT.landscape}
        onClick={(e) => e.stopPropagation()}
      >
        {/* viewfinder corners */}
        {['-left-3 -top-3 border-l border-t', '-right-3 -top-3 border-r border-t', '-left-3 -bottom-3 border-l border-b', '-right-3 -bottom-3 border-r border-b'].map((c) => (
          <span key={c} className={`absolute h-6 w-6 border-blood ${c}`} />
        ))}
        {info ? (
          <iframe
            src={info.embed}
            title={item.title}
            className="h-full w-full bg-black"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <NoSignal />
        )}
        {info && (
          <a href={info.link} target="_blank" rel="noreferrer" className="label absolute -bottom-9 right-0 flex items-center gap-1 text-mute hover:text-bone">
            Open on {{ youtube: 'YouTube', instagram: 'Instagram', drive: 'Google Drive' }[info.platform]} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      </div>
    </div>
  )
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  )
}

function NoSignal() {
  const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0']
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
      <div className="flex flex-[3]">
        {bars.map((b) => <div key={b} className="flex-1 opacity-70" style={{ background: b }} />)}
      </div>
      <div className="flex flex-1 bg-[#111]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-center">
        <p className="display text-5xl sm:text-7xl">No Signal</p>
        <p className="mono max-w-sm px-6 text-[11px] tracking-[0.15em] text-white/70">
          PLACEHOLDER — PASTE A YOUTUBE, INSTAGRAM OR GOOGLE DRIVE LINK FOR THIS VIDEO AND IT WILL PLAY RIGHT HERE
        </p>
      </div>
      <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </div>
  )
}
