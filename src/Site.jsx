import { useEffect, useState } from 'react'
import { startLenis, ScrollTrigger } from './lib/motion'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import BackgroundFX from './components/BackgroundFX'
import Nav from './components/Nav'
import TimelineBar from './components/TimelineBar'
import { VideoModalProvider } from './components/VideoModal'
import Hero from './sections/Hero'
import Marquee from './sections/Marquee'
import Showreel from './sections/Showreel'
import Work from './sections/Work'
import Reels from './sections/Reels'
import About from './sections/About'
import Contact from './sections/Contact'

export default function Site() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    startLenis()
  }, [])

  useEffect(() => {
    if (!ready) return
    // fonts/images can shift layout after load — re-measure triggers
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const t = setTimeout(() => ScrollTrigger.refresh(), 800)
    return () => clearTimeout(t)
  }, [ready])

  return (
    <VideoModalProvider>
      <Preloader onDone={() => setReady(true)} />
      <BackgroundFX />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <Nav ready={ready} />
      <main className="relative z-10">
        <Hero ready={ready} />
        <Marquee />
        <Showreel />
        <Work />
        <Reels />
        <About />
        <Contact />
      </main>
      <TimelineBar ready={ready} />
    </VideoModalProvider>
  )
}
