import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion'
import { useContent } from '../lib/content'
import { Search, Bulb, Scissors, Wave, Send, Quote, Spark } from '../components/Icons'

const ICONS = [Search, Bulb, Scissors, Wave, Send]

// Three panels from the reference: Education & Skills · Work Process · Quote.
export default function About() {
  const { education, skills, process, quote, profile } = useContent()
  const root = useRef(null)

  useGSAP(
    () => {
      const st = (trigger, start = 'top 80%') => ({ trigger, start })
      gsap.from('.ab-col', { opacity: 0, y: 60, stagger: 0.15, duration: 1.2, ease: 'expo.out', scrollTrigger: st(root.current) })
      gsap.from('.ab-edu', { opacity: 0, x: -20, stagger: 0.1, duration: 0.9, ease: 'power3.out', scrollTrigger: st('.ab-edu-list') })
      gsap.from('.ab-skill', { opacity: 0, scale: 0.6, stagger: { each: 0.04, from: 'random' }, duration: 0.7, ease: 'back.out(2)', scrollTrigger: st('.ab-skills') })

      // process: the connector "renders" like a timeline as you scroll
      gsap.fromTo('.ab-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.ab-steps', start: 'top 70%', end: 'bottom 60%', scrub: true } })
      gsap.utils.toArray('.ab-step').forEach((el) => {
        gsap.from(el, { opacity: 0.15, duration: 0.6, scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' } })
        gsap.fromTo(el.querySelector('.ab-node'), { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' },
          { borderColor: '#e0182d', color: '#ffffff', duration: 0.5, scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' } })
      })

      gsap.from('.ab-quote-word', { yPercent: 100, opacity: 0, stagger: 0.04, duration: 1, ease: 'expo.out', scrollTrigger: st('.ab-quote') })
      gsap.fromTo('.ab-sign', { clipPath: 'inset(-30% 100% -30% -30%)' }, { clipPath: 'inset(-30% -30% -30% -30%)', duration: 2, ease: 'power2.inOut', scrollTrigger: st('.ab-quote', 'top 60%') })
    },
    { scope: root }
  )

  return (
    <section ref={root} id="about" className="border-y border-line">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[1fr_1fr_0.8fr]">
        {/* Education & skills */}
        <div className="ab-col border-line px-5 py-16 sm:px-8 md:py-20 lg:border-r">
          <p className="mono text-[11px] text-blood">[03]</p>
          <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide md:text-[28px]">Education & Skills</h2>

          <p className="label mt-10 text-blood">Education</p>
          <div className="ab-edu-list mt-5 space-y-6 border-b border-line pb-8">
            {education.map((e) => (
              <div key={e.title} className="ab-edu flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="mt-1 text-sm text-mute">{e.place}</p>
                </div>
                {e.year && <span className="mono shrink-0 text-xs text-blood">{e.year}</span>}
              </div>
            ))}
          </div>

          <p className="label mt-8 text-blood">Toolkit & Skills</p>
          <div className="ab-skills mt-5 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className={`ab-skill label flex cursor-default items-center gap-2 rounded-[4px] border px-3.5 py-2.5 text-[10px] transition-colors duration-300 hover:border-blood hover:bg-blood/10 hover:text-white ${/learning/i.test(s) ? 'border-dashed border-blood/60 text-white/90' : 'border-line text-white/75'}`}>
                {/learning/i.test(s) && <span className="rec-dot h-1.5 w-1.5 rounded-full bg-blood" />}
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Process */}
        <div id="process" className="ab-col border-t border-line px-5 py-16 sm:px-8 md:py-20 lg:border-r lg:border-t-0">
          <p className="mono text-[11px] text-blood">[04]</p>
          <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide md:text-[28px]">Work Process</h2>

          <div className="ab-steps relative mt-10">
            <span className="absolute bottom-6 left-[62px] top-6 w-px bg-white/10" />
            <span className="ab-line absolute bottom-6 left-[62px] top-6 w-px origin-top bg-blood shadow-[0_0_8px_rgba(224,24,45,0.8)]" />
            <ol className="space-y-7">
              {process.map((p, i) => {
                const Icon = ICONS[i % ICONS.length]
                return (
                  <li key={p.title} className="ab-step relative flex items-start gap-5">
                    <span className="display w-7 pt-3 text-3xl text-blood">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ab-node relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-ink">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="pt-1.5">
                      <p className="label font-semibold text-blood">{p.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/65">{p.text}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        {/* Quote */}
        <div className="ab-col ab-quote relative flex min-h-[520px] flex-col justify-between overflow-hidden bg-wine px-8 py-16 md:px-10 md:py-20">
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(90% 70% at 20% 0%, rgba(224,24,45,0.55), transparent 60%), radial-gradient(80% 60% at 100% 100%, rgba(0,0,0,0.6), transparent 70%)' }} />
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
            style={{ background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 14px)' }} />

          <div className="relative">
            <Quote className="h-12 w-12 text-blood" />
            <p className="mt-6 text-2xl leading-snug md:text-[28px]">
              {quote.text.split(' ').map((w, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom">
                  <span className="ab-quote-word inline-block">{w}&nbsp;</span>
                </span>
              ))}
            </p>
            <p className="ab-sign mt-6 font-script text-6xl text-bone/90">{profile.signature}</p>
          </div>

          <div className="relative mt-12">
            <p className="label max-w-[220px] leading-relaxed text-white/80">{quote.cta}</p>
            <Spark className="mt-6 h-4 w-4 text-blood spin-slow" />
          </div>
        </div>
      </div>
    </section>
  )
}
