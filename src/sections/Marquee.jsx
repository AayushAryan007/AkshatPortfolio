import { useRef } from 'react'
import { useContent } from '../lib/content'
import { Spark } from '../components/Icons'

// Two tilted strips that sway slowly left ↔ right, always in opposite directions.
// Pure CSS animation: runs on the compositor, so it stays smooth on phones.
export default function Marquee() {
  const { marquee } = useContent()
  const root = useRef(null)

  const Row = ({ outline }) => (
    <div className={`mq-row flex w-max will-change-transform ${outline ? 'mq-sway-b' : 'mq-sway-a'}`}>
      {[0, 1, 2].map((k) => (
        <div key={k} className="flex shrink-0 items-center">
          {marquee.map((m) => (
            <span key={m + k} className="flex items-center">
              <span className={`display px-6 text-5xl md:text-7xl ${outline ? 'text-outline' : 'text-ink'}`}>{m}</span>
              <Spark className={`h-5 w-5 md:h-7 md:w-7 ${outline ? 'text-white/20' : 'text-ink'}`} />
            </span>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <section ref={root} aria-hidden="true" className="relative overflow-hidden py-10 md:py-16">
      <div className="relative -rotate-[2deg] scale-105 overflow-hidden border-y border-blood/40 bg-blood py-3 md:py-4">
        {/* slow light sheen across the red strip */}
        <div className="mq-sheen pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <Row />
      </div>
      <div className="mt-3 rotate-[1deg] scale-105 py-2">
        <Row outline />
      </div>
    </section>
  )
}
