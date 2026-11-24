import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'

// Dot (locked 1:1 to the pointer) + a ring that trails very slightly.
// Elements with data-cursor="play" | "view" morph the ring into a labelled disc.
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const [label, setLabel] = useState('')
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  )

  useEffect(() => {
    if (!enabled) return
    const d = dot.current
    const r = ring.current
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, shown = false, current = '-'

    // Ring follows with a light lerp; dot is written directly in the event (no frame delay).
    const loop = () => {
      rx += (x - rx) * 0.35
      ry += (y - ry) * 0.35
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    const move = (e) => {
      x = e.clientX
      y = e.clientY
      d.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      if (!shown) {
        shown = true
        rx = x
        ry = y
        d.style.opacity = '1'
        r.style.opacity = '1'
      }
    }

    const over = (e) => {
      const t = e.target.closest('[data-cursor]')
      const hover = e.target.closest('a, button')
      const kind = t?.dataset.cursor || ''
      const state = kind || (hover ? 'hover' : '')
      if (state === current) return
      current = state
      setLabel(kind)
      gsap.to(r, {
        width: kind ? 92 : hover ? 56 : 34,
        height: kind ? 92 : hover ? 56 : 34,
        backgroundColor: kind ? 'rgba(224,24,45,0.92)' : 'rgba(224,24,45,0)',
        borderColor: kind ? 'rgba(224,24,45,0)' : hover ? 'rgba(224,24,45,1)' : 'rgba(255,255,255,0.5)',
        duration: 0.25,
        ease: 'power3.out',
        overwrite: true,
      })
      d.style.opacity = kind ? '0' : '1'
    }

    document.documentElement.classList.add('has-cursor')
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div
        ref={ring}
        style={{ opacity: 0, willChange: 'transform' }}
        className="pointer-events-none fixed left-0 top-0 z-[100] flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/50"
      >
        <span className="mono text-[10px] font-medium tracking-[0.2em] text-white uppercase">{label}</span>
      </div>
      <div
        ref={dot}
        style={{ opacity: 0, willChange: 'transform' }}
        className="pointer-events-none fixed left-0 top-0 z-[101] h-[6px] w-[6px] rounded-full bg-blood"
      />
    </>
  )
}
