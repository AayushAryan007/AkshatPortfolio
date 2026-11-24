import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion'
import Scramble from './Scramble'

// "SELECTED WORK ———————— 02 / 05" style header from the reference design.
export default function SectionHead({ index, title, right, className = '' }) {
  const root = useRef(null)
  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%' } })
      tl.from('.sh-title', { yPercent: 110, duration: 1, ease: 'expo.out' })
        .from('.sh-line', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.inOut' }, 0)
        .from('.sh-meta', { opacity: 0, duration: 0.8 }, 0.4)
    },
    { scope: root }
  )
  return (
    <div ref={root} className={`flex items-center gap-5 md:gap-8 ${className}`}>
      <span className="sh-meta mono text-[11px] text-blood">[{index}]</span>
      <span className="line-mask">
        <h2 className="sh-title text-2xl font-semibold uppercase tracking-wide md:text-[28px]">
          <Scramble text={title} />
        </h2>
      </span>
      <span className="sh-line h-px flex-1 bg-white/15" />
      {right && <span className="sh-meta">{right}</span>}
    </div>
  )
}
