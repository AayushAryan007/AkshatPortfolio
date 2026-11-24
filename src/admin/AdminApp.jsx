import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate, useSearchParams } from 'react-router'
import { hasSupabase, supabase } from '../lib/supabase'
import { AuthProvider, RequireAdmin, useAuth } from './auth'
import { Button, Card, Field, Input, Spinner, ToastProvider, inputClass } from './ui'
import Dashboard from './Dashboard'
import VideosList from './VideosList'
import VideoForm from './VideoForm'
import ContentEditor from './ContentEditor'

function Brand() {
  return (
    <Link to="/admin" className="flex items-center gap-2.5 text-[1.05rem] font-medium tracking-[-0.02em]">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-blood shadow-[0_0_18px_2px_rgba(224,24,45,0.5)]">
        <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
      </span>
      <span className="display text-[1.3rem] tracking-wide">Akshat <span className="text-blood">Admin</span></span>
    </Link>
  )
}

function AuthCard({ title, description, children }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center"><Brand /></div>
        <Card className="p-6 sm:p-8">
          <h1 className="text-[1.6rem] leading-tight tracking-[-0.03em]">{title}</h1>
          {description && <p className="mt-2 text-[0.9rem] text-mute">{description}</p>}
          <div className="mt-6">{children}</div>
        </Card>
        <p className="mt-6 text-center text-[0.85rem]"><Link to="/" className="text-mute hover:text-bone">← Back to the site</Link></p>
      </div>
    </div>
  )
}

function Alert({ children, tone = 'error' }) {
  return (
    <p role="alert" className={`rounded-xl border px-3.5 py-2.5 text-[0.85rem] ${tone === 'error' ? 'border-blood/40 bg-blood/10 text-ember' : 'border-bone/15 bg-bone/[0.05] text-bone/85'}`}>
      {children}
    </p>
  )
}

function Login() {
  const { isAdmin, loading, error: authError } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [show, setShow] = useState(false)
  const [error, setError] = useState(params.get('error') === 'link-expired' ? 'That link has expired. Request a new one.' : '')

  const next = params.get('next')
  const destination = next?.startsWith('/admin') ? next : '/admin'
  if (!loading && isAdmin) return <Navigate to={destination} replace />

  async function onSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setPending(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')).trim(),
      password: String(form.get('password')),
    })
    if (error) {
      setPending(false)
      setError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message)
      return
    }
    // AuthProvider confirms admin rights, then the redirect above kicks in.
    navigate(destination, { replace: true })
  }

  return (
    <AuthCard title="Sign in" description="Manage your videos, reels and portfolio content.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[0.8rem] font-medium text-bone/80">Password</label>
            <Link to="/admin/forgot-password" className="text-[0.8rem] text-ember hover:text-bone">Forgot password?</Link>
          </div>
          <div className="relative">
            <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required className={`${inputClass} pr-16`} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 px-4 text-[0.8rem] text-mute hover:text-bone" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {(error || authError === 'not-admin') && <Alert>{error || 'This account doesn’t have admin access.'}</Alert>}
        <Button type="submit" className="w-full" disabled={pending}>{pending && <Spinner />}Sign in</Button>
      </form>
    </AuthCard>
  )
}

function ForgotPassword() {
  const [state, setState] = useState({ pending: false, sent: false, error: '' })
  async function onSubmit(e) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email')).trim()
    setState({ pending: true, sent: false, error: '' })
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/reset-password` })
    setState({ pending: false, sent: !error, error: error?.message ?? '' })
  }
  return (
    <AuthCard title="Reset password" description="We’ll email you a link to set a new password.">
      {state.sent ? (
        <Alert tone="info">If that email has an account, a reset link is on its way. Check your inbox.</Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" required /></Field>
          {state.error && <Alert>{state.error}</Alert>}
          <Button type="submit" className="w-full" disabled={state.pending}>{state.pending && <Spinner />}Send reset link</Button>
        </form>
      )}
      <p className="mt-5 text-[0.85rem]"><Link to="/admin/login" className="text-ember hover:text-bone">Back to sign in</Link></p>
    </AuthCard>
  )
}

function ResetPassword() {
  return (
    <AuthCard title="Set a new password">
      <ResetPasswordForm />
      <p className="mt-5 text-[0.85rem]"><Link to="/admin" className="text-ember hover:text-bone">Go to the dashboard →</Link></p>
    </AuthCard>
  )
}

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/videos', label: 'Videos & reels' },
  { to: '/admin/content', label: 'Site content' },
  { to: '/admin/account', label: 'Password' },
]

function PanelLayout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const navClass = ({ isActive }) =>
    `block rounded-xl px-3.5 py-2.5 text-[0.92rem] transition-colors ${isActive ? 'bg-blood/15 text-bone shadow-[inset_2px_0_0_var(--color-blood)]' : 'text-bone/70 hover:bg-bone/[0.04] hover:text-bone'}`

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/85 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Close' : 'Menu'}</Button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} fixed inset-x-0 top-[57px] bottom-0 z-20 overflow-y-auto border-r border-line bg-ink/95 p-4 lg:inset-y-0 lg:left-0 lg:right-auto lg:top-0 lg:flex lg:w-60 lg:flex-col`}>
        <div className="mb-8 hidden px-2 pt-2 lg:block"><Brand /></div>
        <nav className="flex flex-col gap-1" aria-label="Admin">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass} onClick={() => setOpen(false)}>{l.label}</NavLink>)}
        </nav>
        <div className="mt-8 border-t border-line pt-4 lg:mt-auto">
          <a href="/" target="_blank" rel="noreferrer" className="block rounded-xl px-3.5 py-2 text-[0.88rem] text-bone/70 hover:text-bone">View site ↗</a>
          <p className="mt-3 truncate px-3.5 text-[0.75rem] text-mute" title={user?.email}>{user?.email}</p>
          <Button variant="plain" size="sm" className="mt-1 px-3.5" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </aside>
      <main className="px-4 py-8 sm:px-8 lg:ml-60 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1100px]"><Outlet /></div>
      </main>
    </div>
  )
}

function Account() {
  const { recovery } = useAuth()
  return (
    <div className="max-w-[440px]">
      <h1 className="mb-2 text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.05] tracking-[-0.035em]">Password</h1>
      <p className="mb-6 text-[0.95rem] text-mute">{recovery ? 'You signed in with a reset link. Choose a new password.' : 'Change the password you sign in with.'}</p>
      <Card><ResetPasswordForm /></Card>
    </div>
  )
}

function ResetPasswordForm() {
  const [state, setState] = useState({ pending: false, error: '', done: false })
  async function onSubmit(e) {
    e.preventDefault()
    const el = e.currentTarget
    const form = new FormData(el)
    const password = String(form.get('password'))
    if (password.length < 8) return setState({ pending: false, error: 'Use at least 8 characters.', done: false })
    if (password !== String(form.get('confirm'))) return setState({ pending: false, error: 'The passwords don’t match.', done: false })
    setState({ pending: true, error: '', done: false })
    const { error } = await supabase.auth.updateUser({ password })
    setState({ pending: false, error: error?.message ?? '', done: !error })
    if (!error) el.reset()
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="New password" htmlFor="np"><Input id="np" name="password" type="password" autoComplete="new-password" minLength={8} required /></Field>
      <Field label="Confirm password" htmlFor="cp"><Input id="cp" name="confirm" type="password" autoComplete="new-password" minLength={8} required /></Field>
      {state.error && <Alert>{state.error}</Alert>}
      {state.done && <Alert tone="info">Password updated.</Alert>}
      <Button type="submit" disabled={state.pending}>{state.pending && <Spinner />}Save password</Button>
    </form>
  )
}

function NotConfigured() {
  return (
    <AuthCard title="Connect Supabase" description="The admin panel needs a Supabase project.">
      <ol className="list-decimal space-y-2 pl-5 text-[0.9rem] text-bone/80">
        <li>Copy <code className="font-mono text-ember">.env.example</code> to <code className="font-mono text-ember">.env.local</code>.</li>
        <li>Fill in <code className="font-mono text-ember">VITE_SUPABASE_URL</code> and <code className="font-mono text-ember">VITE_SUPABASE_PUBLISHABLE_KEY</code>.</li>
        <li>Restart <code className="font-mono text-ember">npm run dev</code>.</li>
      </ol>
    </AuthCard>
  )
}

export default function AdminApp() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    document.title = 'Admin · Akshat Aryan'
    return () => meta.remove()
  }, [])

  if (!hasSupabase) return <NotConfigured />

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<RequireAdmin><ResetPassword /></RequireAdmin>} />
          <Route element={<RequireAdmin><PanelLayout /></RequireAdmin>}>
            <Route index element={<Dashboard />} />
            <Route path="videos" element={<VideosList />} />
            <Route path="videos/new" element={<VideoForm />} />
            <Route path="videos/:id" element={<VideoForm />} />
            <Route path="content" element={<ContentEditor />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
