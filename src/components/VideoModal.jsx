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

function Modal({ item, onClose }) {
  const root = useRef(null)
  const info = parseVideo(item.url)
  const vertical = item.format ? item.format === 'vertical' : info?.vertical

  const close = useCallback(() => {
    gsap.to(root.current, { opacity: 0, duration: 0.35, onComplete: onClose })
    gsap.to('.vm-frame', { scale: 0.94, duration: 0.35, ease: 'power2.in' })
  }, [onClose])

  useEffect(() => {
    const lenis = getLenis()
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
    gsap.fromTo('.vm-frame', { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.8, ease: 'expo.out', delay: 0.1 })
    const key = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', key)
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
      window.removeEventListener('keydown', key)
    }
  }, [close])

  return (
    <div ref={root} className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl sm:p-10" onClick={close}>
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-8 sm:right-8">
        <div>
          <p className="label text-blood">{item.category}</p>
          <p className="display text-2xl sm:text-3xl">{item.title}</p>
        </div>
        <button onClick={close} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-blood hover:bg-blood" aria-label="Close video">
          <Close />
        </button>
      </div>

      <div
        className={`vm-frame relative mt-12 ${vertical ? 'aspect-[9/16] h-[78vh] max-w-full' : 'aspect-video w-full max-w-6xl'}`}
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
