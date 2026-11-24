import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { ContentProvider } from './lib/content'
import Site from './Site'

// The admin panel is a separate bundle; visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="mono text-[11px] tracking-[0.3em] text-blood">404 · NO SIGNAL</p>
      <h1 className="display text-[22vw] sm:text-[12rem]">Lost Frame</h1>
      <Link to="/" className="btn-primary rounded-full px-6 py-3 text-sm font-medium">Back to the reel</Link>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="min-h-dvh bg-ink" />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route index element={<ContentProvider><Site /></ContentProvider>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
