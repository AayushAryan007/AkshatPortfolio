import { useRef } from 'react'
import { gsap, useGSAP, reduceMotion } from '../lib/motion'
import { useContent } from '../lib/content'
import { parseVideo } from '../lib/video'
import { useVideoModal } from '../components/VideoModal'
import { Play } from '../components/Icons'

// A letterboxed frame that expands to full-bleed as you scroll into it.
export default function Showreel() {
  const { profile, showreel } = useContent()
  const root = useRef(null)
  const open = useVideoModal()
  const info = parseVideo(showreel.url)

  useGSAP(
    () => {
      if (reduceMotion) return
      gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'center center', scrub: 1 },
      })
        .fromTo('.sr-frame', { clipPath: 'inset(18% 22% 18% 22% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' })
        .fromTo('.sr-img', { scale: 1.35 }, { scale: 1, ease: 'none' }, 0)
        .fromTo('.sr-title-l', { xPercent: -30 }, { xPercent: 0, ease: 'none' }, 0)
        .fromTo('.sr-title-r', { xPercent: 30 }, { xPercent: 0, ease: 'none' }, 0)
    },
    { scope: root }
  )

  return (
    <section ref={root} className="relative py-10 md:py-20" aria-label="Showreel">
      <button
        type="button"
        onClick={() => open({ title: showreel.label, category: 'Showreel', url: showreel.url })}
        data-cursor="play"
        className="sr-frame group relative block h-[70svh] w-full overflow-hidden md:h-[92svh]"
      >
        {info?.thumbHi ? (
          <img src={info.thumbHi} alt="" className="sr-img absolute inset-0 h-full w-full object-cover opacity-70" />
        ) : (
          <div className="sr-img absolute inset-0">
            <img src={profile.photo} alt="" className="h-full w-full object-cover object-[50%_25%] opacity-50 blur-[1px] grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-blood/25" />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)' }} />
        {/* letterbox bars */}
        <div className="absolute inset-x-0 top-0 h-[8%] bg-black" />
        <div className="absolute inset-x-0 bottom-0 h-[8%] bg-black" />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="display flex items-center gap-[3vw] text-[16vw] leading-none md:text-[13vw]">
            <span className="sr-title-l">SHOW</span>
            <span className="relative flex h-[12vw] w-[12vw] max-h-40 max-w-40 min-h-16 min-w-16 items-center justify-center rounded-full bg-blood transition-transform duration-500 group-hover:scale-110">
              <span className="absolute inset-0 animate-ping rounded-full bg-blood/40" />
              <Play className="relative ml-[6%] h-1/3 w-1/3" />
            </span>
            <span className="sr-title-r text-outline">REEL</span>
          </div>
          <p className="mono mt-6 text-[11px] tracking-[0.3em] text-white/60">
            {showreel.label.toUpperCase()} · {showreel.duration} · CLICK TO PLAY
          </p>
        </div>

        <span className="mono absolute left-5 top-[10%] text-[10px] tracking-[0.2em] text-white/50 sm:left-8">SCENE 01 / TAKE 03</span>
        <span className="mono absolute right-5 top-[10%] flex items-center gap-2 text-[10px] tracking-[0.2em] text-white/50 sm:right-8">
          <span className="rec-dot h-1.5 w-1.5 rounded-full bg-blood" /> PLAYBACK
        </span>
      </button>
    </section>
  )
}
