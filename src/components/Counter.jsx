import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion'

export default function Counter({ value, suffix = '', delay = 0, start = true, className = '' }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (!start) return
      const obj = { n: 0 }
      gsap.to(obj, {
        n: value,
        duration: 2.2,
        delay,
        ease: 'power3.out',
        onUpdate: () => {
          if (ref.current) ref.current.textContent = Math.round(obj.n) + suffix
        },
      })
    },
    { dependencies: [start, value] }
  )

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}
