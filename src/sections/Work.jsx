import { useMemo, useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../lib/motion'
import { useContent } from '../lib/content'
import { parseVideo } from '../lib/video'
import SectionHead from '../components/SectionHead'
import VideoCard from '../components/VideoCard'

const isVertical = (v) => (v.format ? v.format === 'vertical' : parseVideo(v.url)?.vertical)

export default function Work() {
  const { videos } = useContent()
  const root = useRef(null)
  const landscape = useMemo(() => videos.filter((v) => !isVertical(v)), [videos])
  const cats = useMemo(() => ['All', ...new Set(landscape.map((v) => v.category).filter(Boolean))], [landscape])
  const [cat, setCat] = useState('All')
  const list = cat === 'All' ? landscape : landscape.filter((v) => v.category === cat)

  useGSAP(
    () => {
      const cards = root.current.querySelectorAll('.vc')
      gsap.set(cards, { opacity: 0, y: 80 })
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out', overwrite: true }),
      })
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [cat], revertOnUpdate: true }
  )

  return (
    <section ref={root} id="work" className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 md:py-28">
      <SectionHead
        index="01"
        title="Selected Work"
        right={<span className="mono text-[11px] text-mute">{String(list.length).padStart(2, '0')} / {String(landscape.length).padStart(2, '0')}</span>}
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`label rounded-full border px-4 py-2 text-[10px] transition-colors duration-300 ${cat === c ? 'border-blood bg-blood text-white' : 'border-line text-white/60 hover:border-white/40 hover:text-white'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-6 md:gap-y-16">
        {list.map((v, i) => (
          <VideoCard
            key={v.id}
            item={v}
            index={landscape.indexOf(v)}
            size={i < 2 ? 'lg' : 'md'}
            className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}
          />
        ))}
      </div>
    </section>
  )
}
