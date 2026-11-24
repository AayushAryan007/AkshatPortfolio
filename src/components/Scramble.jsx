import { useRef } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ'

// Text that decodes through random glyphs on hover — a "signal tuning" effect.
export default function Scramble({ text, className = '', as: Tag = 'span' }) {
  const ref = useRef(null)
  const raf = useRef(0)

  const run = () => {
    cancelAnimationFrame(raf.current)
    let frame = 0
    const total = text.length * 2.2
    const tick = () => {
      const out = text
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' '
          if (i < frame / 2.2) return ch
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join('')
      if (ref.current) ref.current.textContent = out
      frame++
      if (frame <= total) raf.current = requestAnimationFrame(tick)
      else if (ref.current) ref.current.textContent = text
    }
    tick()
  }

  return (
    <Tag ref={ref} onMouseEnter={run} className={className} aria-label={text}>
      {text}
    </Tag>
  )
}
