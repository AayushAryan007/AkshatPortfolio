const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const make = (paths) =>
  function Icon({ className = 'w-5 h-5', ...rest }) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} {...rest}>
        {paths}
      </svg>
    )
  }

export const Arrow = make(<path d="M3 12h17m-6-6 6 6-6 6" />)
export const ArrowUpRight = make(<path d="M7 17 17 7M8 7h9v9" />)
export const Play = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
  </svg>
)
export const Close = make(<path d="M6 6l12 12M18 6 6 18" />)
export const Mail = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>)
export const Globe = make(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>)
export const Phone = make(<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />)
export const Pin = make(<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>)
export const Search = make(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>)
export const Bulb = make(<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></>)
export const Scissors = make(<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.1 8.1 20 20M8.1 15.9 20 4" /></>)
export const Wave = make(<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0" />)
export const Send = make(<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />)
export const Quote = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="currentColor">
    <path d="M6 38V26C6 15 11 9 20 7l1.5 4C16 13 13.5 17 13.5 22H20v16H6zm22 0V26c0-11 5-17 14-19l1.5 4c-5.5 2-8 6-8 11H42v16H28z" />
  </svg>
)

// Four-point sparkle used across the design
export const Spark = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12 0c.6 6.5 5.5 11.4 12 12-6.5.6-11.4 5.5-12 12-.6-6.5-5.5-11.4-12-12C6.5 11.4 11.4 6.5 12 0z" />
  </svg>
)
