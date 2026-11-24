// Splits text into masked characters so each can slide up independently.
export default function SplitChars({ text, charClass = '', className = '' }) {
  return (
    <span className={`inline-block overflow-hidden align-bottom pb-[0.04em] ${className}`} aria-label={text}>
      {text.split('').map((c, i) => (
        <span key={i} aria-hidden="true" className={`inline-block will-change-transform ${charClass}`}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  )
}
