import { useMemo, useRef } from 'react'
import { gsap, useGSAP, reduceMotion } from '../lib/motion'
import { useContent } from '../lib/content'
import { parseVideo } from '../lib/video'
import VideoCard from '../components/VideoCard'

// Vertical (9:16) work. On desktop the section pins and the reels travel
// sideways as you scroll; on touch screens it's a native swipe carousel.
export default function Reels() {
  const { videos, socials } = useContent()
  const insta = socials.find((s) => /instagram/i.test(s.label) && s.url)?.url
  const root = useRef(null)
  const track = useRef(null)
  const reels = useMemo(
    () => videos.filter((v) => (v.format ? v.format === 'vertical' : parseVideo(v.url)?.vertical)),
    [videos]
  )

  useGSAP(
    () => {
      gsap.from('.rl-head > *', {
        yPercent: 100, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })
      if (reduceMotion) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const dist = () => track.current.scrollWidth - window.innerWidth + 64
        gsap.to(track.current, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set('.rl-progress', { scaleX: self.progress }),
          },
        })
        gsap.utils.toArray('.rl-card').forEach((card, i) => {
          gsap.fromTo(card, { rotate: i % 2 ? 3 : -3, y: i % 2 ? 40 : 0 }, { rotate: 0, y: 0, duration: 1, scrollTrigger: { trigger: root.current, start: 'top 60%' } })
        })
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} id="reels" className="relative overflow-hidden py-20 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(closest-side,rgba(224,24,45,0.15),transparent)]" />

      <div className="mx-auto flex w-full max-w-[1600px] items-end justify-between gap-6 px-5 sm:px-8">
        <div className="rl-head line-mask">
          <p className="mono text-[11px] text-blood">[02] SHORT-FORM</p>
          <h2 className="display mt-2 text-6xl md:text-8xl">
            Reels <span className="text-outline">&</span> Shorts
          </h2>
        </div>
        <div className="hidden w-48 lg:block">
          <span className="label text-[10px] text-mute">Scroll to scrub</span>
          <div className="mt-2 h-px w-full bg-white/15">
            <div className="rl-progress h-full origin-left scale-x-0 bg-blood" />
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto [scrollbar-width:none] lg:overflow-visible">
        <div ref={track} className="flex w-max gap-4 px-5 sm:px-8 md:gap-6 lg:pl-[max(2rem,calc((100vw-1600px)/2+2rem))]">
          {reels.map((r, i) => (
            <div key={r.id} className="rl-card w-[62vw] shrink-0 sm:w-[38vw] lg:w-[clamp(220px,17vw,300px)]">
              <VideoCard item={r} index={i} vertical />
            </div>
          ))}
          <a
            href={insta || undefined}
            target="_blank"
            rel="noreferrer"
            className="group flex w-[62vw] shrink-0 flex-col justify-center sm:w-[38vw] lg:w-[clamp(220px,17vw,300px)]"
          >
            <p className="display text-outline text-5xl">More on</p>
            <p className="display text-5xl text-blood transition-colors group-hover:text-ember">Instagram</p>
            <p className="label mt-3 text-mute">Follow for daily edits →</p>
          </a>
        </div>
      </div>
    </section>
  )
}
