import { useEffect, useRef } from 'react'
import { gsap, useGSAP, reduceMotion } from '../lib/motion'
import { useContent } from '../lib/content'
import { Globe, Play, Spark } from '../components/Icons'
import SplitChars from '../components/SplitChars'
import Counter from '../components/Counter'
import Magnetic from '../components/Magnetic'
import { useVideoModal } from '../components/VideoModal'

export default function Hero({ ready }) {
  const { profile, stats, showreel } = useContent()
  const root = useRef(null)
  const nameRef = useRef(null)
  const openVideo = useVideoModal()

  // Intro + scroll choreography
  useGSAP(
    () => {
      if (!ready) return
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo('.h-photo', { clipPath: 'inset(48% 0% 48% 0%)', scale: 1.25, filter: 'blur(14px) brightness(2)' },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, filter: 'blur(0px) brightness(1)', duration: 1.9 })
        .from('.h-glow', { opacity: 0, duration: 2 }, 0)
        .from('.h-corner', { scale: 0, opacity: 0, stagger: 0.05, duration: 1 }, 0.3)
        .from('.h-hud', { opacity: 0, y: 8, stagger: 0.06, duration: 0.8 }, 0.6)
        .from('.h-hello', { opacity: 0, x: -30, duration: 1.2 }, 0.55)
        .from('.h-char', { yPercent: 115, stagger: 0.04, duration: 1.2 }, 0.6)
        .from('.h-fade', { opacity: 0, y: 24, stagger: 0.08, duration: 1 }, 0.95)
        .from('.h-stat', { opacity: 0, x: 30, stagger: 0.1, duration: 1 }, 1)
        .from('.h-badge', { opacity: 0, scale: 0.6, duration: 1.2, ease: 'back.out(2)' }, 1.1)

      if (reduceMotion) return
      gsap.to('.h-photo-wrap', {
        yPercent: 14,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.matchMedia(root).add('(min-width: 768px)', () => {
        gsap.to('.h-content', {
          y: -120,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 20%', scrub: true },
        })
      })
    },
    { scope: root, dependencies: [ready] }
  )

  // Mouse parallax
  useEffect(() => {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return
    const el = root.current
    const px = gsap.quickTo('.h-photo-inner', 'x', { duration: 1.2, ease: 'power3' })
    const py = gsap.quickTo('.h-photo-inner', 'y', { duration: 1.2, ease: 'power3' })
    const nx = gsap.quickTo('.h-name', 'x', { duration: 1.4, ease: 'power3' })
    const gx = gsap.quickTo('.h-glow', 'x', { duration: 2, ease: 'power3' })
    const move = (e) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      px(x * -18)
      py(y * -10)
      nx(x * 22)
      gx(x * 120)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [])

  // Occasional RGB-split glitch on the name
  useEffect(() => {
    if (!ready || reduceMotion) return
    const els = nameRef.current?.querySelectorAll('.glitch') || []
    const id = setInterval(() => {
      els.forEach((el) => {
        el.classList.remove('is-glitching')
        void el.offsetWidth
        el.classList.add('is-glitching')
      })
    }, 4200)
    return () => clearInterval(id)
  }, [ready])

  return (
    <section ref={root} id="home" className="relative min-h-[100svh] overflow-hidden md:h-[100svh] md:min-h-[680px]">
      {/* ambient glow + grid */}
      <div className="h-glow pointer-events-none absolute left-1/2 top-[35%] h-[90vh] w-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(224,24,45,0.25),transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(70% 70% at 50% 40%, #000, transparent)' }} />

      {/* photo */}
      <div className="h-photo-wrap absolute inset-x-0 top-0 h-[76svh] md:inset-x-auto md:left-1/2 md:h-full md:-translate-x-1/2 md:aspect-[896/1130]">
        <div className="h-photo-inner absolute inset-0">
          <img
            src={profile.photo}
            alt={`${profile.firstName} portrait`}
            className="h-photo h-full w-full object-cover object-[50%_18%]"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, #000 62%, transparent 98%), linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
              WebkitMaskComposite: 'source-in',
              maskImage: 'linear-gradient(to bottom, #000 62%, transparent 98%), linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </div>

      {/* viewfinder HUD */}
      <div className="pointer-events-none absolute inset-x-4 bottom-12 top-20 hidden sm:inset-x-8 md:top-24 md:block">
        <span className="h-corner absolute left-0 top-0 h-8 w-8 border-l border-t border-white/40" />
        <span className="h-corner absolute right-0 top-0 h-8 w-8 border-r border-t border-white/40" />
        <span className="h-corner absolute bottom-0 left-0 h-8 w-8 border-b border-l border-white/40" />
        <span className="h-corner absolute bottom-0 right-0 h-8 w-8 border-b border-r border-white/40" />
        <span className="h-hud mono absolute left-1/2 top-3 -translate-x-1/2 text-[10px] tracking-[0.25em] text-white/50">4K · 24 FPS · LOG</span>
        <span className="h-hud mono absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.25em] text-white/40">ISO 800 · ƒ/1.8 · 1/50</span>
        <span className="h-hud absolute left-1/2 top-[42%] -translate-x-1/2">
          <span className="block h-4 w-px bg-white/25" />
          <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-white/25" />
        </span>
      </div>

      {/* content */}
      <div className="h-content relative z-10 mx-auto h-full max-w-[1600px] px-5 sm:px-8">
        {/* left */}
        <div className="pt-[50svh] md:absolute md:left-14 md:top-[24%] md:max-w-[460px] md:pt-0 lg:left-16">
          <p className="h-hello font-script text-5xl leading-none text-bone md:text-6xl">Hello, I’m</p>
          <h1 ref={nameRef} className="h-name display mt-2 text-[22vw] text-bone md:text-[clamp(5rem,9vw,9.5rem)]">
            <span className="glitch block" data-text={profile.firstName}>
              <SplitChars text={profile.firstName} charClass="h-char" />
            </span>
            <span className="glitch block text-outline" data-text={profile.lastName}
              style={{ WebkitTextStroke: '1.5px rgba(242,239,234,0.85)' }}>
              <SplitChars text={profile.lastName} charClass="h-char" />
            </span>
          </h1>
          <p className="h-fade mt-5 text-lg font-semibold uppercase leading-snug tracking-wide text-blood md:text-xl">
            {profile.roles.join(' & ')}
          </p>
          <p className="h-fade mt-4 max-w-md text-[15px] leading-relaxed text-white/65">{profile.intro}</p>

          <div className="h-fade mt-7 flex flex-wrap items-center gap-6">
            <Magnetic>
              <button
                onClick={() => openVideo({ title: showreel.label, category: 'Showreel', url: showreel.url })}
                data-cursor="play"
                className="group flex items-center gap-4 rounded-full border border-white/15 bg-white/[0.03] py-2 pl-2 pr-6 backdrop-blur-md transition-colors hover:border-blood"
              >
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-blood">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blood/50" />
                  <Play className="relative ml-0.5 h-4 w-4" />
                </span>
                <span className="text-left leading-tight">
                  <span className="label block text-bone">Play showreel</span>
                  <span className="mono text-[10px] text-mute">{showreel.duration}</span>
                </span>
              </button>
            </Magnetic>
            <span className="label flex items-center gap-2 text-white/60">
              <Globe className="h-4 w-4 text-blood" /> {profile.location}
            </span>
          </div>
        </div>

        {/* right: badge */}
        <div className="h-badge absolute right-14 top-[30%] hidden items-center gap-4 lg:flex">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-blood/70">
            <span className="absolute inset-[-6px] rounded-full border border-dashed border-white/15 spin-slow" />
            <Spark className="h-5 w-5 text-bone" />
          </span>
          <p className="max-w-[190px] text-sm leading-snug text-white/80">{profile.badge}</p>
        </div>

        {/* right: stats */}
        <div className="mt-10 grid grid-cols-3 gap-3 pb-6 md:absolute md:bottom-24 md:right-14 md:mt-0 md:grid-cols-1 md:gap-0 md:pb-0 lg:right-16">
          {stats.map((s, i) => (
            <div key={s.label} className={`h-stat flex flex-col gap-1 border-t border-line pt-3 md:w-[240px] md:flex-row md:items-center md:gap-6 md:py-4 ${i === stats.length - 1 ? '' : 'md:border-b-0'}`}>
              <Counter value={s.value} suffix={s.suffix} start={ready} delay={1.1 + i * 0.12} className="display text-4xl text-blood md:w-20 md:text-5xl" />
              <span className="label text-[10px] leading-snug text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* scroll cue */}
      <div className="h-fade absolute bottom-14 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="label text-[10px] text-white/50">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/15">
          <span className="scan-sweep absolute inset-x-0 top-0 h-1/2 bg-blood" />
        </span>
      </div>
    </section>
  )
}
