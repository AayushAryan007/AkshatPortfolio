import { useRef, useState } from 'react'
import { gsap, useGSAP, reduceMotion } from '../lib/motion'

// Film-leader countdown (3·2·1) with a sweeping hand, then the frame splits open.
export default function Preloader({ onDone }) {
  const root = useRef(null)
  const [n, setN] = useState(3)

  useGSAP(
    () => {
      if (reduceMotion) {
        onDone()
        gsap.set(root.current, { autoAlpha: 0 })
        return
      }
      const tl = gsap.timeline()
      const steps = [3, 2, 1]
      steps.forEach((num, i) => {
        tl.call(() => setN(num), null, i * 0.36)
        tl.fromTo('.pl-sweep', { rotate: 0 }, { rotate: 360, duration: 0.36, ease: 'none' }, i * 0.36)
        tl.fromTo('.pl-num', { scale: 1.25, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }, i * 0.36)
      })
      tl.to('.pl-dial', { scale: 0.6, opacity: 0, duration: 0.35, ease: 'power3.in' }, '+=0.05')
        .to('.pl-flash', { opacity: 1, duration: 0.06 }, '<0.25')
        .to('.pl-flash', { opacity: 0, duration: 0.25 })
        .to('.pl-top', { yPercent: -100, duration: 0.75, ease: 'expo.inOut' }, '<')
        .to('.pl-bot', { yPercent: 100, duration: 0.75, ease: 'expo.inOut' }, '<')
        .call(onDone, null, '<0.35')
        .set(root.current, { display: 'none' })
    },
    { scope: root }
  )

  return (
    <div ref={root} className="fixed inset-0 z-[90] pointer-events-none">
      <div className="pl-top absolute inset-x-0 top-0 h-1/2 bg-ink border-b border-blood/40" />
      <div className="pl-bot absolute inset-x-0 bottom-0 h-1/2 bg-ink border-t border-blood/40" />

      <div className="pl-dial absolute inset-0 flex items-center justify-center">
        <div className="relative h-56 w-56 sm:h-72 sm:w-72">
          {/* crosshair */}
          <div className="absolute left-1/2 top-[-30%] h-[160%] w-px -translate-x-1/2 bg-white/10" />
          <div className="absolute top-1/2 left-[-30%] w-[160%] h-px -translate-y-1/2 bg-white/10" />
          <div className="absolute inset-0 rounded-full border border-white/15" />
          <div className="absolute inset-6 rounded-full border border-white/10" />
          <div className="pl-sweep absolute inset-0 rounded-full origin-center"
            style={{ background: 'conic-gradient(from 0deg, rgba(224,24,45,0.55), rgba(224,24,45,0) 30%, transparent)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="pl-num display text-[7rem] sm:text-[9rem] text-bone">{n}</span>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 mono text-[11px] tracking-[0.3em] text-mute">
          LOADING REEL<span className="rec-dot text-blood"> ●</span>
        </div>
      </div>

      <div className="pl-flash absolute inset-0 bg-white opacity-0" />
    </div>
  )
}
