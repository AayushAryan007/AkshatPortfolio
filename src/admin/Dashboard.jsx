import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import { Card, PageHeader } from './ui'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const count = (q) => q.then((r) => r.count ?? 0)
    const base = () => supabase.from('videos').select('id', { count: 'exact', head: true })
    Promise.all([
      count(base().eq('format', 'landscape')),
      count(base().eq('format', 'vertical')),
      count(base().eq('is_published', false)),
      supabase.from('site_content').select('key').then((r) => r.data ?? []),
    ]).then(([landscape, vertical, hidden, edited]) => setStats({ landscape, vertical, hidden, edited }))
  }, [])

  const tiles = [
    { label: 'Videos (16:9)', value: stats?.landscape },
    { label: 'Reels & Shorts', value: stats?.vertical },
    { label: 'Hidden', value: stats?.hidden },
    { label: 'Sections edited', value: stats?.edited.length },
  ]

  const btn = 'btn-primary inline-flex min-h-[42px] items-center rounded-full px-5 text-[0.9rem] font-medium'
  const ghost = 'glass inline-flex min-h-[42px] items-center rounded-full px-5 text-[0.9rem] text-bone/85 hover:text-bone'

  return (
    <>
      <PageHeader title="Dashboard" description="Your whole portfolio, editable without touching code." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="flex min-h-[112px] flex-col justify-between">
            <span className="text-[0.8rem] text-bone/75">{t.label}</span>
            <span className="display text-[2.8rem] leading-none text-blood">{t.value ?? '–'}</span>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Card>
          <h2 className="text-[1.15rem] tracking-[-0.02em]">Videos & reels</h2>
          <p className="mt-1.5 text-[0.9rem] text-mute">Paste YouTube, Instagram or Google Drive links. They play inside the site, in the Selected Work grid or the Reels carousel.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/admin/videos/new" className={btn}>Add a video</Link>
            <Link to="/admin/videos" className={ghost}>Manage videos</Link>
          </div>
        </Card>
        <Card>
          <h2 className="text-[1.15rem] tracking-[-0.02em]">Site content</h2>
          <p className="mt-1.5 text-[0.9rem] text-mute">Name, photo, stats, showreel, skills, education, process, contact and social links.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/admin/content" className={ghost}>Edit content</Link>
            <a href="/" target="_blank" rel="noreferrer" className={ghost}>View site ↗</a>
          </div>
        </Card>
      </div>
    </>
  )
}
