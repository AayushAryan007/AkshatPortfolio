import { useRef } from 'react'
import { gsap, useGSAP, reduceMotion } from '../lib/motion'
import { useContent } from '../lib/content'
import { Mail, Globe, Phone, Pin, Arrow, ArrowUpRight, Spark } from '../components/Icons'
import Magnetic from '../components/Magnetic'
import Scramble from '../components/Scramble'

export default function Contact() {
  const { contact, profile, socials } = useContent()
  const root = useRef(null)

  const rows = [
    { Icon: Mail, value: contact.email, href: `mailto:${contact.email}` },
    { Icon: Globe, value: contact.website, href: `https://${contact.website.replace(/^https?:\/\//, '')}` },
    { Icon: Phone, value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}` },
    { Icon: Pin, value: contact.location },
  ].filter((r) => r.value)
  const links = socials.filter((s) => s.url)

  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      tl.from('.ct-line', { yPercent: 110, stagger: 0.1, duration: 1.2, ease: 'expo.out' })
        .from('.ct-fade', { opacity: 0, y: 20, stagger: 0.08, duration: 0.9 }, 0.3)
        .from('.ct-row', { opacity: 0, x: 40, stagger: 0.08, duration: 0.9, ease: 'power3.out' }, 0.3)
        .from('.ct-row-line', { scaleX: 0, transformOrigin: 'left', stagger: 0.08, duration: 1.2, ease: 'expo.inOut' }, 0.3)

      if (reduceMotion) return
      // giant name fills with red as it scrolls into view
      gsap.fromTo('.ct-giant-fill', { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', ease: 'none',
        scrollTrigger: { trigger: '.ct-giant', start: 'top bottom', end: 'bottom bottom', scrub: true },
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} id="contact" className="relative overflow-hidden pt-20 md:pt-28">
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[70vh] w-[70vh] rounded-full bg-blood/15 blur-[140px] transform-gpu" />

      <div className="relative mx-auto grid max-w-[1600px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="ct-fade mono text-[11px] text-blood">[05] CONTACT</p>
          <h2 className="display mt-4 text-[17vw] sm:text-[12vw] lg:text-[7.5vw] xl:text-[8rem]">
            {contact.heading.map((l, i) => (
              <span key={l} className="line-mask">
                <span className="ct-line flex items-start gap-4">
                  {l}
                  {i === contact.heading.length - 1 && <Spark className="mt-[0.1em] h-[0.3em] w-[0.3em] text-blood spin-slow" />}
                </span>
              </span>
            ))}
          </h2>
          <p className="ct-fade mt-6 max-w-md leading-relaxed text-white/65">{contact.text}</p>

          <div className="ct-fade mt-9">
            <Magnetic>
              <a href={`mailto:${contact.email}`} className="group relative flex items-center gap-4 overflow-hidden rounded-full border border-blood py-2 pl-2 pr-7">
                <span className="absolute inset-0 origin-left scale-x-0 bg-blood transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-blood text-blood transition-colors group-hover:border-white group-hover:text-white">
                  <Arrow className="h-5 w-5" />
                </span>
                <span className="label relative text-blood transition-colors group-hover:text-white">
                  {profile.available ? 'Available for freelance' : 'Get in touch'}
                </span>
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="lg:pt-24">
          {rows.map(({ Icon, value, href }) => {
            const Inner = (
              <>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blood/70 text-blood transition-colors duration-300 group-hover:bg-blood group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <Scramble text={value} className="flex-1 truncate text-base md:text-xl" />
                {href && <ArrowUpRight className="h-5 w-5 text-white/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blood" />}
              </>
            )
            return (
              <div key={value} className="ct-row relative">
                {href ? (
                  <a href={href} className="group flex items-center gap-5 py-5">{Inner}</a>
                ) : (
                  <div className="group flex items-center gap-5 py-5">{Inner}</div>
                )}
                <span className="ct-row-line absolute inset-x-0 bottom-0 h-px bg-white/10" />
              </div>
            )
          })}

          {links.length > 0 && <div className="ct-fade mt-10 flex flex-wrap gap-3">
            {links.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                className="label group flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[10px] text-white/70 transition-colors hover:border-blood hover:text-white">
                {s.label} <ArrowUpRight className="h-3 w-3 transition-transform group-hover:rotate-45" />
              </a>
            ))}
          </div>}
        </div>
      </div>

      {/* giant footer name */}
      <div className="ct-giant relative mt-20 select-none md:mt-28" aria-hidden="true">
        <div className="display text-outline whitespace-nowrap text-center text-[23vw] leading-[0.8]">{profile.firstName}</div>
        <div className="ct-giant-fill display absolute inset-0 whitespace-nowrap text-center text-[23vw] leading-[0.8] text-blood">{profile.firstName}</div>
      </div>

      <footer className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 border-t border-line px-5 pb-16 pt-6 sm:px-8 sm:pb-14">
        <span className="label text-[10px] text-mute">© {new Date().getFullYear()} {profile.firstName} {profile.lastName} — All rights reserved</span>
        <span className="label text-[10px] text-mute">{profile.roles.join(' · ')}</span>
      </footer>
    </section>
  )
}
