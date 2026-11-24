import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, scrollToId, timecode, getLenis, ScrollTrigger } from '../lib/motion'
import { useContent } from '../lib/content'
import { nav } from '../data/content'
import { Spark } from './Icons'
import Scramble from './Scramble'

export default function Nav({ ready }) {
  const { profile, socials } = useContent()
  const root = useRef(null)
  const tc = useRef(null)
  const [open, setOpen] = useState(false)

  // Live "recording" timecode since page load
  useEffect(() => {
    const t0 = performance.now()
    let raf
    const loop = () => {
      if (tc.current) tc.current.textContent = timecode((performance.now() - t0) / 1000)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  useGSAP(
    () => {
      if (!ready) return
      gsap.from('.nav-item', { y: -24, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.5 })
    },
    { scope: root, dependencies: [ready] }
  )

  // Hide the bar while scrolling down, reveal it when scrolling up
  useEffect(() => {
    const bar = root.current.querySelector('.nav-bar')
    let dir = -1
    const st = ScrollTrigger.create({
      start: 120,
      end: 'max',
      onUpdate: (self) => {
        if (self.direction === dir) return
        dir = self.direction
        gsap.to(bar, { yPercent: dir === 1 ? -110 : 0, duration: 0.45, ease: 'power3.out', overwrite: true })
      },
      onLeaveBack: () => {
        dir = -1
        gsap.to(bar, { yPercent: 0, duration: 0.45, overwrite: true })
      },
    })
    return () => st.kill()
  }, [])

  // Full-screen menu
  useGSAP(
    () => {
      const lenis = getLenis()
      if (open) {
        lenis?.stop()
        gsap.timeline()
          .set('.menu', { display: 'flex' })
          .fromTo('.menu', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
          .from('.menu-link', { yPercent: 110, stagger: 0.06, duration: 0.8, ease: 'expo.out' }, '-=0.35')
          .from('.menu-meta', { opacity: 0, y: 10, duration: 0.5 }, '-=0.5')
      } else {
        lenis?.start()
        gsap.to('.menu', { clipPath: 'inset(100% 0 0% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: () => gsap.set('.menu', { display: 'none' }) })
      }
    },
    { scope: root, dependencies: [open] }
  )

  const go = (id) => {
    setOpen(false)
    setTimeout(() => scrollToId(id), open ? 450 : 0)
  }

  return (
    <header ref={root}>
      <div className={`nav-bar fixed inset-x-0 top-0 z-[70] ${open ? '!translate-y-0' : ''}`}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/80 to-transparent" />
        <div className="relative mx-auto flex max-w-[1600px] items-center justify-between px-5 pt-5 sm:px-8 md:pt-6">
          <button onClick={() => go('home')} className="nav-item text-left leading-tight">
            <span className="label flex items-center gap-1.5 text-blood">
              <span className="inline-block h-0 w-0 border-l-[7px] border-y-[4px] border-y-transparent border-l-blood" />
              {profile.brand}
            </span>
            <span className="label block text-white/70">{profile.tagline}</span>
          </button>

          <div className="nav-item hidden items-center gap-3 md:flex">
            <span className="rec-dot h-2 w-2 rounded-full bg-blood" />
            <span className="mono text-[11px] tracking-[0.2em] text-white/80">REC</span>
            <span ref={tc} className="mono text-[11px] tracking-[0.15em] text-white/60 tabular-nums">00:00:00:00</span>
          </div>

          <div className="nav-item flex items-center gap-6">
            {profile.available && (
              <span className="label hidden items-center gap-2 text-white/80 sm:flex">
                Available for freelance <Spark className="h-3 w-3 text-blood spin-slow" />
              </span>
            )}
            <button
              onClick={() => setOpen((o) => !o)}
              className="group flex items-center gap-3"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span className="label text-white">{open ? 'Close' : 'Menu'}</span>
              <span className="flex w-7 flex-col items-end gap-[5px]">
                <span className={`h-px bg-white transition-all duration-500 ${open ? 'w-7 translate-y-[3px] rotate-45' : 'w-7'}`} />
                <span className={`h-px bg-white transition-all duration-500 ${open ? 'w-7 -translate-y-[3px] -rotate-45' : 'w-4 group-hover:w-7'}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="menu fixed inset-0 z-[65] hidden flex-col justify-between bg-coal px-5 pb-8 pt-28 sm:px-8"
        style={{ clipPath: 'inset(0 0 100% 0)' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(60% 60% at 85% 100%, rgba(224,24,45,0.35), transparent 70%)' }} />
        <nav className="relative mx-auto w-full max-w-[1600px]">
          {nav.map((n, i) => (
            <div key={n.id} className="overflow-hidden border-b border-line">
              <button onClick={() => go(n.id)} className="menu-link group flex w-full items-baseline gap-5 py-2 text-left">
                <span className="mono text-xs text-blood">0{i + 1}</span>
                <span className="display text-[13vw] transition-colors duration-300 group-hover:text-blood sm:text-[9vw] md:text-[6.5vw]">
                  <Scramble text={n.label} />
                </span>
              </button>
            </div>
          ))}
        </nav>
        <div className="menu-meta relative mx-auto flex w-full max-w-[1600px] flex-wrap justify-between gap-4">
          <div className="flex gap-6">
            {socials.filter((s) => s.url).map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="label text-mute hover:text-bone">
                {s.label}
              </a>
            ))}
          </div>
          <span className="label text-mute">© {new Date().getFullYear()} {profile.firstName}</span>
        </div>
      </div>
    </header>
  )
}
