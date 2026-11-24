import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, scrollToId, timecode } from '../lib/motion'
import { nav } from '../data/content'

// Fixed editing-timeline at the bottom of the screen: each section is a clip,
// the red playhead tracks scroll progress. Click a clip to jump there.
export default function TimelineBar({ ready }) {
  const head = useRef(null)
  const tc = useRef(null)
  const [clips, setClips] = useState([])
  const [active, setActive] = useState('home')

  useEffect(() => {
    if (!ready) return
    const measure = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setClips(
        nav
          .map((n) => {
            const el = document.getElementById(n.id)
            if (!el) return null
            const top = el.getBoundingClientRect().top + window.scrollY
            const start = Math.max(0, top / total)
            const end = Math.min(1, (top + el.offsetHeight) / total)
            return { ...n, start, end }
          })
          .filter(Boolean)
      )
    }
    measure()
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const p = self.progress
        if (head.current) head.current.style.transform = `translateX(${p * (head.current.parentElement.offsetWidth)}px)`
        if (tc.current) tc.current.textContent = timecode(p * 184) // a 3-minute "reel"
      },
      onRefresh: measure,
    })
    const ids = nav.map((n) => n.id)
    const sts = ids.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (s) => s.isActive && setActive(id),
      })
    )
    return () => {
      st.kill()
      sts.forEach((s) => s.kill())
    }
  }, [ready])

  return (
    <div className={`fixed inset-x-0 bottom-0 z-[60] transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
      <div className="relative mx-auto flex max-w-[1600px] items-center gap-4 px-5 pb-3 sm:px-8 sm:pb-4">
        <span ref={tc} className="mono hidden w-[92px] text-[10px] tracking-[0.12em] text-white/60 tabular-nums sm:block">
          00:00:00:00
        </span>
        <div className="relative h-5 flex-1">
          {/* ruler ticks */}
          <div className="absolute inset-x-0 top-0 h-1.5"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 1px, transparent 1px 2%)' }} />
          {/* clips */}
          {clips.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollToId(c.id)}
              className="group absolute bottom-0 h-2.5 px-px"
              style={{ left: `${c.start * 100}%`, width: `${(c.end - c.start) * 100}%` }}
              aria-label={`Jump to ${c.label}`}
            >
              <span className={`block h-full w-full rounded-[2px] transition-colors duration-300 ${active === c.id ? 'bg-blood/80' : 'bg-white/12 group-hover:bg-white/30'}`} />
              <span className={`label absolute -top-4 left-1 hidden text-[9px] transition-opacity md:block ${active === c.id ? 'text-white opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100'}`}>
                {c.label}
              </span>
            </button>
          ))}
          {/* playhead */}
          <div ref={head} className="pointer-events-none absolute -top-1 bottom-0 w-px bg-blood shadow-[0_0_10px_2px_rgba(224,24,45,0.7)]" style={{ left: 0, willChange: 'transform' }}>
            <span className="absolute -left-[4px] -top-1 h-0 w-0 border-x-[4.5px] border-t-[6px] border-x-transparent border-t-blood" />
          </div>
        </div>
      </div>
    </div>
  )
}
