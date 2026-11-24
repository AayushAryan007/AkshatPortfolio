import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { parseVideo } from '../lib/video'
import { clearContentCache } from '../lib/content'
import { Button, Card, Input, PageHeader, Toggle, useToast } from './ui'
import { deleteVideo, thumbFor } from './video-actions'

const TABS = [
  { id: 'landscape', label: 'Videos (16:9)', note: 'Shown in the Selected Work grid. The first two appear large.' },
  { id: 'vertical', label: 'Reels & Shorts (9:16)', note: 'Shown in the sideways-scrolling Reels & Shorts section.' },
]

export default function VideosList() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'vertical' ? 'vertical' : 'landscape'
  const [videos, setVideos] = useState(null)
  const [busy, setBusy] = useState(false)
  const [quick, setQuick] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) return toast(error.message, 'error')
    setVideos(data)
  }, [toast])

  useEffect(() => { load() }, [load])

  const list = videos?.filter((v) => v.format === tab) ?? []
  const counts = Object.fromEntries(TABS.map((t) => [t.id, videos?.filter((v) => v.format === t.id).length ?? 0]))

  async function patch(v, values, message) {
    setVideos((all) => all.map((x) => (x.id === v.id ? { ...x, ...values } : x)))
    const { error } = await supabase.from('videos').update(values).eq('id', v.id)
    if (error) {
      toast(error.message, 'error')
      load()
    } else {
      clearContentCache()
      if (message) toast(message)
    }
  }

  // Swap with a neighbour inside this tab, then persist the tab's order as 10, 20, 30…
  async function move(index, dir) {
    const j = index + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[index], next[j]] = [next[j], next[index]]
    const ordered = next.map((v, i) => ({ ...v, sort_order: (i + 1) * 10 }))
    const byId = Object.fromEntries(ordered.map((v) => [v.id, v]))
    setVideos((all) => all.map((v) => byId[v.id] ?? v).sort((a, b) => a.sort_order - b.sort_order))
    setBusy(true)
    const results = await Promise.all(ordered.map((v) => supabase.from('videos').update({ sort_order: v.sort_order }).eq('id', v.id)))
    setBusy(false)
    const failed = results.find((r) => r.error)
    if (failed) {
      toast(failed.error.message, 'error')
      load()
    } else clearContentCache()
  }

  async function remove(v) {
    if (!window.confirm(`Delete “${v.title}”? This can’t be undone.`)) return
    try {
      await deleteVideo(v)
      clearContentCache()
      setVideos((all) => all.filter((x) => x.id !== v.id))
      toast('Video deleted')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  function quickAdd(e) {
    e.preventDefault()
    const info = parseVideo(quick)
    if (!info) return toast('That doesn’t look like a YouTube or Instagram link.', 'error')
    navigate(`/admin/videos/new?url=${encodeURIComponent(quick.trim())}`)
  }

  const current = TABS.find((t) => t.id === tab)

  return (
    <>
      <PageHeader
        title="Videos & reels"
        description="Paste YouTube or Instagram links — they play right on the site. Hidden videos stay off the site."
        actions={<Link to={`/admin/videos/new?format=${tab}`} className="btn-primary inline-flex min-h-[42px] items-center rounded-full px-5 text-[0.9rem] font-medium">Add video</Link>}
      />

      <Card className="mb-6">
        <form onSubmit={quickAdd} className="flex flex-col gap-3 sm:flex-row">
          <Input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="Quick add: paste a YouTube or Instagram link…" type="url" />
          <Button type="submit" className="shrink-0">Continue →</Button>
        </form>
        <p className="mt-2 text-[0.75rem] text-mute">YouTube Shorts and Instagram reels are filed under Reels automatically.</p>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === 'vertical' ? { tab: 'vertical' } : {})}
            className={`rounded-full px-4 py-2 text-[0.85rem] transition-colors ${tab === t.id ? 'bg-blood text-white' : 'glass text-bone/75 hover:text-bone'}`}
          >
            {t.label} <span className="ml-1 opacity-70">{counts[t.id]}</span>
          </button>
        ))}
      </div>
      <p className="mb-5 text-[0.85rem] text-mute">
        {current.note} Until you add one, the site shows placeholder cards here.
      </p>

      {videos === null && <p className="text-mute">Loading…</p>}
      {videos && list.length === 0 && (
        <Card className="text-center">
          <p className="text-bone/80">No {tab === 'vertical' ? 'reels' : 'videos'} yet.</p>
          <Link to={`/admin/videos/new?format=${tab}`} className="mt-3 inline-block text-ember hover:text-bone">Add the first one →</Link>
        </Card>
      )}

      <ul className="flex flex-col gap-3">
        {list.map((v, i) => {
          const thumb = thumbFor(v)
          const info = parseVideo(v.url)
          return (
            <li key={v.id}>
              <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-4">
                <div className="flex shrink-0 gap-1 sm:flex-col">
                  <Button variant="ghost" size="sm" className="w-9 px-0" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label={`Move ${v.title} up`}>↑</Button>
                  <Button variant="ghost" size="sm" className="w-9 px-0" onClick={() => move(i, 1)} disabled={busy || i === list.length - 1} aria-label={`Move ${v.title} down`}>↓</Button>
                </div>
                <Link to={`/admin/videos/${v.id}`} className={`shrink-0 overflow-hidden rounded-lg bg-coal ${v.format === 'vertical' ? 'h-[96px] w-[54px]' : 'h-[72px] w-[128px]'}`}>
                  {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-center text-[0.65rem] text-mute">{info?.platform ?? 'No cover'}</span>}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/videos/${v.id}`} className="text-[1.05rem] tracking-[-0.01em] hover:text-ember">
                    <span className="mr-2 font-mono text-[0.8rem] text-blood">{String(i + 1).padStart(2, '0')}</span>{v.title}
                  </Link>
                  <p className="truncate text-[0.85rem] text-mute">{[v.category, v.client, v.year].filter(Boolean).join(' · ') || '—'}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-[0.78rem] text-bone/60">
                    <span className="capitalize">{info?.platform ?? 'Unknown link'}</span>
                    <a href={v.url} target="_blank" rel="noreferrer" className="hover:text-bone">Open ↗</a>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-[0.82rem] text-bone/75">
                    <Toggle checked={v.is_published} onChange={(val) => patch(v, { is_published: val }, val ? 'Now live on the site' : 'Hidden from the site')} label={`Show ${v.title}`} />
                    {v.is_published ? 'Live' : 'Hidden'}
                  </label>
                  <Link to={`/admin/videos/${v.id}`} className="glass inline-flex min-h-[34px] items-center rounded-full px-3 text-[0.8rem] text-bone/85 hover:text-bone">Edit</Link>
                  <Button variant="danger" size="sm" onClick={() => remove(v)}>Delete</Button>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </>
  )
}
