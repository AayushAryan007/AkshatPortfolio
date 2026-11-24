import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { mediaUrl, supabase } from '../lib/supabase'
import { parseVideo } from '../lib/video'
import { processImage } from '../lib/image-process'
import { clearContentCache } from '../lib/content'
import { Button, Card, Field, Input, PageHeader, Spinner, Toggle, useImageDrop, useToast } from './ui'
import { CATEGORY_SUGGESTIONS, deleteVideo } from './video-actions'

const EMPTY = { title: '', category: '', client: '', year: '', url: '', format: 'landscape', cover_path: null, is_published: true }

export default function VideoForm() {
  const { id } = useParams()
  const isNew = !id
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const fileInput = useRef(null)

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formatTouched, setFormatTouched] = useState(!isNew)
  const [initialCover, setInitialCover] = useState(null)

  useEffect(() => {
    if (isNew) {
      const url = params.get('url') ?? ''
      const info = parseVideo(url)
      const format = params.get('format') === 'vertical' || info?.vertical ? 'vertical' : 'landscape'
      setForm({ ...EMPTY, url, format })
      return
    }
    supabase.from('videos').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) {
        toast(error.message, 'error')
        navigate('/admin/videos', { replace: true })
        return
      }
      setForm(data)
      setInitialCover(data.cover_path)
    })
  }, [id, isNew, params, navigate, toast])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const info = parseVideo(form?.url ?? '')

  function onUrl(url) {
    const next = parseVideo(url)
    // Auto-pick the format from the link until the admin chooses one by hand.
    if (next && !formatTouched) set({ url, format: next.vertical ? 'vertical' : 'landscape' })
    else set({ url })
  }

  async function uploadCover(file) {
    if (!file) return
    setUploading(true)
    try {
      const img = await processImage(file, { full: 1280, thumb: 400 })
      const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${img.ext}`
      const { error } = await supabase.storage.from('media').upload(path, img.full, {
        contentType: img.ext === 'webp' ? 'image/webp' : 'image/jpeg',
        cacheControl: '31536000',
      })
      if (error) throw error
      // Drop a cover uploaded earlier in this same edit session (never the saved one).
      if (form.cover_path && form.cover_path !== initialCover) await supabase.storage.from('media').remove([form.cover_path])
      set({ cover_path: path })
      toast('Cover uploaded. Save to publish it.')
    } catch (e) {
      toast(e.message, 'error')
    }
    setUploading(false)
  }

  const dragging = useImageDrop((files) => uploadCover(files[0]), uploading)

  async function save(e) {
    e.preventDefault()
    if (!info) return toast('Paste a valid YouTube, Instagram or Google Drive link.', 'error')
    if (!form.title.trim()) return toast('Give the video a title.', 'error')
    setSaving(true)
    const values = {
      title: form.title.trim(),
      category: form.category.trim() || null,
      client: (form.client ?? '').trim() || null,
      year: (form.year ?? '').trim() || null,
      url: form.url.trim(),
      format: form.format,
      cover_path: form.cover_path || null,
      is_published: form.is_published,
    }
    let error
    if (isNew) {
      // New videos go to the end of their section.
      const { data: last } = await supabase.from('videos').select('sort_order').eq('format', form.format).order('sort_order', { ascending: false }).limit(1).maybeSingle()
      ;({ error } = await supabase.from('videos').insert({ ...values, sort_order: (last?.sort_order ?? 0) + 10 }))
    } else {
      ;({ error } = await supabase.from('videos').update(values).eq('id', id))
    }
    if (!error && initialCover && initialCover !== values.cover_path) {
      await supabase.storage.from('media').remove([initialCover])
    }
    setSaving(false)
    if (error) return toast(error.message, 'error')
    clearContentCache()
    toast(isNew ? 'Video added' : 'Video saved')
    navigate(`/admin/videos${form.format === 'vertical' ? '?tab=vertical' : ''}`)
  }

  async function remove() {
    if (!window.confirm(`Delete “${form.title || 'this video'}”? This can’t be undone.`)) return
    try {
      await deleteVideo(form)
      clearContentCache()
      toast('Video deleted')
      navigate('/admin/videos')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  if (!form) return <p className="text-mute">Loading…</p>

  const cover = form.cover_path ? mediaUrl(form.cover_path) : info?.thumb
  const vertical = form.format === 'vertical'

  return (
    <>
      <PageHeader
        title={isNew ? 'Add video' : 'Edit video'}
        description="Paste the link, check the preview, give it a title and save."
        actions={<Link to="/admin/videos" className="glass inline-flex min-h-[42px] items-center rounded-full px-5 text-[0.9rem] text-bone/85 hover:text-bone">← All videos</Link>}
      />

      <form onSubmit={save} className="grid gap-5 lg:grid-cols-[1fr_minmax(280px,400px)]">
        <div className="space-y-5">
          <Card className="space-y-4">
            <Field label="YouTube, Instagram or Google Drive link" htmlFor="url" hint="youtube.com/watch, youtu.be, youtube.com/shorts, instagram.com/reel or /p, and drive.google.com/file/d/… links all work. Drive files must be shared as “Anyone with the link”.">
              <Input id="url" type="url" required value={form.url} onChange={(e) => onUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" autoFocus={isNew} />
            </Field>
            {form.url && (
              <p className={`text-[0.82rem] ${info ? 'text-bone/75' : 'text-ember'}`}>
                {info ? <>✓ Detected <b>{{ youtube: 'YouTube', instagram: 'Instagram', drive: 'Google Drive' }[info.platform]}</b>{info.vertical ? ' (vertical)' : ''}{info.platform === 'drive' ? ' — choose Selected Work or Reels below, and check the file is shared as “Anyone with the link”.' : ''}</> : 'Not a recognised YouTube, Instagram or Google Drive link.'}
              </p>
            )}

            <div>
              <span className="mb-1.5 block text-[0.8rem] font-medium text-bone/80">Where it appears</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'landscape', label: 'Selected Work', sub: '16:9 video' },
                  { id: 'vertical', label: 'Reels & Shorts', sub: '9:16 vertical' },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => { setFormatTouched(true); set({ format: o.id }) }}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${form.format === o.id ? 'border-blood bg-blood/15' : 'border-line hover:border-bone/30'}`}
                  >
                    <span className="block text-[0.9rem]">{o.label}</span>
                    <span className="text-[0.75rem] text-mute">{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Title" htmlFor="title">
                <Input id="title" required maxLength={120} value={form.title} onChange={(e) => set({ title: e.target.value })} />
              </Field>
            </div>
            <Field label="Category" htmlFor="category" hint="Used for the filter buttons on the site.">
              <Input id="category" list="cats" maxLength={60} value={form.category ?? ''} onChange={(e) => set({ category: e.target.value })} />
              <datalist id="cats">{CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Client" htmlFor="client" hint="Optional.">
              <Input id="client" maxLength={80} value={form.client ?? ''} onChange={(e) => set({ client: e.target.value })} />
            </Field>
            <Field label="Year" htmlFor="year" hint="Optional.">
              <Input id="year" maxLength={20} value={form.year ?? ''} onChange={(e) => set({ year: e.target.value })} />
            </Field>
            <label className="flex items-center gap-3 self-end pb-2 text-[0.9rem] text-bone/80">
              <Toggle checked={form.is_published} onChange={(v) => set({ is_published: v })} label="Show on site" />
              {form.is_published ? 'Live on the site' : 'Hidden'}
            </label>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving || uploading}>{saving && <Spinner />}{isNew ? 'Add video' : 'Save changes'}</Button>
            {!isNew && <Button variant="danger" onClick={remove}>Delete</Button>}
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <p className="mb-3 text-[0.8rem] font-medium text-bone/80">Live preview</p>
            <div className={`overflow-hidden rounded-xl bg-black ${vertical ? 'mx-auto aspect-[9/16] max-h-[560px]' : 'aspect-video'}`}>
              {info ? (
                <iframe key={info.embed} src={info.embed.replace('autoplay=1', 'autoplay=0')} title="Preview" className="h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              ) : (
                <div className="grid h-full place-items-center p-6 text-center text-[0.85rem] text-mute">Paste a link to preview it here.</div>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-[0.8rem] font-medium text-bone/80">Cover image</p>
            <p className="mt-1 text-[0.75rem] leading-snug text-mute">
              {info?.platform === 'instagram'
                ? 'Recommended: Instagram doesn’t share thumbnails, so without a cover the card shows a styled placeholder.'
                : info?.platform === 'drive'
                  ? 'Recommended: Drive thumbnails don’t always load for visitors. Upload a cover to be sure.'
                  : 'Optional: YouTube videos use their own thumbnail automatically. Upload one to override it.'}
            </p>
            <div
              className={`mt-3 overflow-hidden rounded-xl border border-dashed transition-colors ${dragging ? 'border-blood bg-blood/10' : 'border-line'} ${vertical ? 'mx-auto aspect-[9/16] w-1/2' : 'aspect-video'}`}
            >
              {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center p-4 text-center text-[0.8rem] text-mute">Drop an image here</div>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading && <Spinner />}{form.cover_path ? 'Replace cover' : 'Upload cover'}
              </Button>
              {form.cover_path && <Button variant="plain" size="sm" onClick={() => set({ cover_path: null })}>Remove cover</Button>}
            </div>
            <input ref={fileInput} type="file" hidden accept="image/*" onChange={(e) => { uploadCover(e.target.files?.[0]); e.target.value = '' }} />
          </Card>
        </div>
      </form>
    </>
  )
}
