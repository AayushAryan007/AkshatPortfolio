import { useEffect, useRef } from 'react'
import { reduceMotion } from '../lib/motion'

// Full-page ambient motion graphics behind every section.
//  · drifting red / wine light blobs (pure CSS transforms — GPU composited, no repaint)
//  · rotating dashed lens rings (CSS)
//  · a light "plexus" of particles + occasional anamorphic light streaks (canvas, capped at 30 fps)
export default function BackgroundFX() {
  const ref = useRef(null)

  useEffect(() => {
    if (reduceMotion) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d', { alpha: true })
    let w = 0, h = 0, raf = 0, running = true, last = 0, acc = 0
    const mouse = { x: -9999, y: -9999 }
    let pts = []
    const streaks = []
    let nextStreak = 2
    const FRAME = 1000 / 30

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w // 1× DPR on purpose: thin glow lines don't need retina and it's 2–4× cheaper
      canvas.height = h
      const count = Math.round(Math.min(42, (w * h) / 32000))
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.5,
      }))
    }

    const draw = (now) => {
      raf = requestAnimationFrame(draw)
      const delta = now - last
      last = now
      acc += delta
      if (acc < FRAME) return
      const dt = Math.min(0.1, acc / 1000)
      acc = 0

      ctx.clearRect(0, 0, w, h)

      // plexus
      const linkDist = Math.min(140, w * 0.14)
      const link2 = linkDist * linkDist
      for (const p of pts) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < 48400 && d2 > 1) {
          const d = Math.sqrt(d2)
          p.vx += (dx / d) * 0.008
          p.vy += (dy / d) * 0.008
        }
        p.vx *= 0.99
        p.vy *= 0.99
        if (Math.abs(p.vx) + Math.abs(p.vy) < 0.12) {
          p.vx += (Math.random() - 0.5) * 0.04
          p.vy += (Math.random() - 0.5) * 0.04
        }
        p.x += p.vx * 2
        p.y += p.vy * 2
        if (p.x < -20) p.x = w + 20
        else if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        else if (p.y > h + 20) p.y = -20
      }
      ctx.lineWidth = 0.6
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < link2) {
            ctx.strokeStyle = `rgba(224,24,45,${(1 - Math.sqrt(d2) / linkDist) * 0.25})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.fillStyle = 'rgba(255,90,100,0.6)'
      for (const a of pts) {
        ctx.fillRect(a.x - a.r / 2, a.y - a.r / 2, a.r, a.r)
      }

      // anamorphic streaks
      nextStreak -= dt
      if (nextStreak <= 0) {
        streaks.push({ y: Math.random() * h, x: -0.5 * w, speed: w * (0.3 + Math.random() * 0.3), len: w * (0.35 + Math.random() * 0.3) })
        nextStreak = 4 + Math.random() * 5
      }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i]
        s.x += s.speed * dt
        const g = ctx.createLinearGradient(s.x, 0, s.x + s.len, 0)
        g.addColorStop(0, 'rgba(224,24,45,0)')
        g.addColorStop(0.5, 'rgba(255,80,90,0.4)')
        g.addColorStop(1, 'rgba(224,24,45,0)')
        ctx.fillStyle = g
        ctx.fillRect(s.x, s.y, s.len, 1)
        ctx.globalAlpha = 0.3
        ctx.fillRect(s.x, s.y - 3, s.len, 7)
        ctx.globalAlpha = 1
        if (s.x > w) streaks.splice(i, 1)
      }
    }

    let mq = 0
    const onMove = (e) => {
      if (mq) return
      mq = requestAnimationFrame(() => {
        mouse.x = e.clientX
        mouse.y = e.clientY
        mq = 0
      })
    }
    const onVis = () => {
      running = !document.hidden
      cancelAnimationFrame(raf)
      if (running) { last = performance.now(); raf = requestAnimationFrame(draw) }
    }

    resize()
    last = performance.now()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(mq)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* light blobs — pre-blurred radial gradients moved only with transforms */}
      <div className="bgfx-blob bgfx-a" />
      <div className="bgfx-blob bgfx-b" />
      <div className="bgfx-blob bgfx-c" />
      {/* lens rings */}
      <svg className="bgfx-ring right-[-8vmin] top-[8vh] h-[62vmin] w-[62vmin]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(224,24,45,0.16)" strokeWidth="0.6" strokeDasharray="1 5" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(224,24,45,0.12)" strokeWidth="0.5" strokeDasharray="22 8 2 8" className="bgfx-rev" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(224,24,45,0.1)" strokeWidth="0.5" strokeDasharray="1 3" />
      </svg>
      <svg className="bgfx-ring bgfx-slow bottom-[-10vmin] left-[-10vmin] h-[44vmin] w-[44vmin]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(224,24,45,0.13)" strokeWidth="0.6" strokeDasharray="2 7" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(224,24,45,0.1)" strokeWidth="0.5" strokeDasharray="16 12" />
      </svg>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
