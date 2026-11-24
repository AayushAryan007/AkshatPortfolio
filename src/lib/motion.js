import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null

export function startLenis() {
  if (lenis || reduceMotion) return lenis
  lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1.15, touchMultiplier: 1.4 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis() {
  return lenis
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
}

// Seconds → broadcast timecode HH:MM:SS:FF at 24 fps
export function timecode(seconds, fps = 24) {
  const s = Math.max(0, seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  const f = Math.floor((s % 1) * fps)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(h)}:${p(m)}:${p(sec)}:${p(f)}`
}

export { gsap, ScrollTrigger, useGSAP }
