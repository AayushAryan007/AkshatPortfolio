/* Small, consistent building blocks for the admin panel. */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export const inputClass =
  'w-full rounded-xl border border-bone/10 bg-bone/[0.04] px-3.5 py-2.5 text-[0.95rem] text-bone placeholder:text-mute/70 outline-none transition-colors focus:border-ember/60 focus:bg-bone/[0.06] disabled:opacity-50'

export function Field({ label, hint, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.8rem] font-medium text-bone/80">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[0.75rem] leading-snug text-mute">{hint}</p>}
    </div>
  )
}

export function Input(props) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function Textarea({ rows = 3, ...props }) {
  return <textarea rows={rows} {...props} className={`${inputClass} resize-y leading-[1.5] ${props.className ?? ''}`} />
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const v = {
    primary: 'btn-primary',
    ghost: 'glass text-bone/85 hover:text-bone hover:border-ember/50',
    danger: 'border border-blood/40 bg-blood/10 text-ember hover:bg-blood/20',
    plain: 'text-bone/70 hover:text-bone',
  }[variant]
  const s = size === 'sm' ? 'min-h-[34px] px-3 text-[0.8rem]' : 'min-h-[42px] px-5 text-[0.9rem]'
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,border-color,color,box-shadow] disabled:pointer-events-none disabled:opacity-50 ${v} ${s} ${className}`}
    />
  )
}

export function Card({ className = '', children }) {
  return <div className={`glass rounded-[20px] p-5 sm:p-6 ${className}`}>{children}</div>
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.05] tracking-[-0.035em]">{title}</h1>
        {description && <p className="mt-2 max-w-[42rem] text-[0.95rem] text-mute">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-blood shadow-[0_0_14px_rgba(230,57,43,0.55)]' : 'bg-bone/15'}`}
    >
      <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-bone transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

export function Spinner({ className = '' }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden="true" />
}

/* ---------- Toasts ---------- */
const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 6000 : 3000)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`glass rounded-xl px-4 py-3 text-[0.9rem] ${t.tone === 'error' ? 'border-blood/60 text-ember' : 'text-bone'}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export const useToast = () => useContext(ToastContext)

/** "My Great App!" → "my-great-app" */
// oxlint-disable-next-line react/only-export-components
export const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

/* ---------- File drop ---------- */
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|heic|heif)$/i
const isImage = (f) => f.type.startsWith('image/') || IMAGE_EXT.test(f.name)

function filesFrom(dt) {
  const fromItems = [...(dt?.items ?? [])].filter((i) => i.kind === 'file').map((i) => i.getAsFile()).filter(Boolean)
  return (fromItems.length ? fromItems : [...(dt?.files ?? [])]).filter(isImage)
}

/**
 * Drag-and-drop for image files. The whole page accepts the drop (so a near
 * miss still works and the browser never opens the file in the tab); the
 * returned `dragging` flag highlights the drop box while files hover.
 */
// oxlint-disable-next-line react/only-export-components
export function useImageDrop(onFiles, disabled = false) {
  const [dragging, setDragging] = useState(false)
  const handler = useRef(onFiles)
  useEffect(() => { handler.current = onFiles })

  useEffect(() => {
    let depth = 0
    const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files')
    const enter = (e) => { if (!hasFiles(e)) return; e.preventDefault(); depth += 1; setDragging(true) }
    const over = (e) => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = disabled ? 'none' : 'copy' }
    const leave = (e) => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) setDragging(false) }
    const drop = (e) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setDragging(false)
      if (disabled) return
      const files = filesFrom(e.dataTransfer)
      if (files.length) handler.current(files)
    }
    window.addEventListener('dragenter', enter)
    window.addEventListener('dragover', over)
    window.addEventListener('dragleave', leave)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragenter', enter)
      window.removeEventListener('dragover', over)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('drop', drop)
    }
  }, [disabled])

  return dragging
}
