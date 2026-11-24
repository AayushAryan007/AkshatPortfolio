/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

/**
 * Tracks the Supabase session and whether it belongs to an admin.
 * This only shapes the UI: every write is still checked by Row Level
 * Security in the database, so a tampered client can't do anything.
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false, recovery: false })

  useEffect(() => {
    let alive = true

    async function resolve(session, recovery = false) {
      const user = session?.user ?? null
      if (!user) return alive && setState({ loading: false, user: null, isAdmin: false, recovery: false })
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
      if (!alive) return
      if (!data) {
        await supabase.auth.signOut()
        setState({ loading: false, user: null, isAdmin: false, recovery: false, error: 'not-admin' })
        return
      }
      setState((s) => ({ loading: false, user, isAdmin: true, recovery: recovery || s.recovery }))
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer: supabase-js warns against awaiting queries inside this callback.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'PASSWORD_RECOVERY') {
        setTimeout(() => resolve(session, event === 'PASSWORD_RECOVERY'), 0)
      }
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

/** Sends signed-out visitors to the login page, remblooding where they were going. */
export function RequireAdmin({ children }) {
  const { loading, isAdmin } = useAuth()
  const { pathname } = useLocation()
  if (loading) return <div className="grid min-h-dvh place-items-center text-mute">Checking your session…</div>
  if (!isAdmin) return <Navigate to={`/admin/login${pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname)}`}`} replace />
  return children
}
