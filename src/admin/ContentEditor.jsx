import { useEffect, useMemo, useRef, useState } from 'react'
import * as defaults from '../data/content'
import { clearContentCache, fetchContentRows } from '../lib/content'
import { mediaUrl, supabase } from '../lib/supabase'
import { processImage } from '../lib/image-process'
import { blankItem, cleanSection, sections } from './content-schema'
import { Button, Card, Field, Input, PageHeader, Spinner, Textarea, Toggle, useToast } from './ui'

const clone = (v) => JSON.parse(JSON.stringify(v))

/* ---------- Field renderers ---------- */

function Upload({ field, value, onChange }) {
  const toast = useToast()
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const isImage = field.type === 'image'

  async function pick(file) {
    if (!file) return
    setBusy(true)
    try {
      const img = await processImage(file, { full: 1800, thumb: 400 })
      const blob = img.full
      const ext = img.ext
      const contentType = ext === 'webp' ? 'image/webp' : 'image/jpeg'
      if (blob.size > 10 * 1024 * 1024) throw new Error('Files must be under 10 MB.')
      const path = `content/${field.folder}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, blob, { contentType, cacheControl: '31536000' })
      if (error) throw error
      onChange(path)
      toast('Uploaded. Save the section to publish it.')
    } catch (e) {
      toast(e.message, 'error')
    }
    setBusy(false)
  }

  const url = mediaUrl(value)
  return (
    <div className="flex flex-wrap items-center gap-3">
      {isImage && url && <img src={url} alt="" className="h-20 w-16 rounded-lg object-cover" />}
      {!isImage && url && <a href={url} target="_blank" rel="noreferrer" className="text-[0.85rem] text-ember hover:text-bone">View current file ↗</a>}
      <Button variant="ghost" size="sm" onClick={() => input.current?.click()} disabled={busy}>
        {busy && <Spinner />}{url ? 'Replace' : 'Upload'}
      </Button>
      <input ref={input} type="file" hidden accept={field.accept ?? 'image/*'} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

function FieldInput({ field, value, onChange, id }) {
  switch (field.type) {
    case 'textarea':
      return <Textarea id={id} rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'lines':
      return <Textarea id={id} rows={Math.max(2, (value?.length ?? 0) + 1)} value={(value ?? []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} />
    case 'tags':
      return <Input id={id} value={(value ?? []).join(',')} onChange={(e) => onChange(e.target.value.split(','))} />
    case 'toggle':
      return <div className="pt-1"><Toggle checked={Boolean(value)} onChange={onChange} label={field.label} /></div>
    case 'number':
      return <Input id={id} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
    case 'file':
    case 'image':
      return <Upload field={field} value={value} onChange={onChange} />
    case 'group':
      return <Fields fields={field.fields} value={value ?? {}} onChange={onChange} prefix={id} columns />
    case 'list':
      return <ListEditor item={field.item} itemTitle={field.itemTitle} value={value ?? []} onChange={onChange} prefix={id} />
    default:
      return <Input id={id} type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  }
}

function Fields({ fields, value, onChange, prefix, columns = false }) {
  const compact = columns || fields.every((f) => ['text', 'number', 'url', 'email', 'toggle'].includes(f.type))
  return (
    <div className={compact && fields.length > 1 ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
      {fields.map((f) => {
        const id = `${prefix}-${f.name}`
        const wide = ['textarea', 'lines', 'list', 'group'].includes(f.type)
        return (
          <div key={f.name} className={wide && compact ? 'sm:col-span-2' : ''}>
            <Field label={f.label} hint={f.hint} htmlFor={id}>
              <FieldInput field={f} id={id} value={value?.[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
            </Field>
          </div>
        )
      })}
    </div>
  )
}

function ListEditor({ item, itemTitle, value, onChange, prefix }) {
  const update = (i, v) => onChange(value.map((x, k) => (k === i ? v : x)))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {value.map((v, i) => (
        <div key={i} className="rounded-[16px] border border-bone/10 bg-bone/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="truncate text-[0.85rem] text-bone/80"><span className="mr-2 font-mono text-mute">{String(i + 1).padStart(2, '0')}</span>{v?.[itemTitle] || 'New item'}</span>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="sm" className="w-9 px-0" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</Button>
              <Button variant="ghost" size="sm" className="w-9 px-0" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">↓</Button>
              <Button variant="danger" size="sm" onClick={() => onChange(value.filter((_, k) => k !== i))}>Remove</Button>
            </div>
          </div>
          <Fields fields={item} value={v} onChange={(nv) => update(i, nv)} prefix={`${prefix}-${i}`} />
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange([...value, blankItem(item)])}>+ Add item</Button>
    </div>
  )
}

/* ---------- Page ---------- */

export default function ContentEditor() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [activeKey, setActiveKey] = useState(sections[0].key)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContentRows()
      .then((data) => setRows(Object.fromEntries(data.map((r) => [r.key, r]))))
      .catch((e) => toast(e.message, 'error'))
  }, [toast])

  const section = sections.find((s) => s.key === activeKey)
  const stored = rows?.[activeKey]
  const base = useMemo(() => {
    if (!rows) return null
    const def = defaults[section.name]
    const val = rows[activeKey]?.value
    if (val == null) return clone(def)
    if (Array.isArray(def) || typeof def !== 'object') return clone(val)
    return { ...clone(def), ...clone(val) }
  }, [rows, activeKey, section])

  // Fresh draft whenever the section (or its saved value) changes.
  const [draftFor, setDraftFor] = useState(null)
  if (base !== draftFor) {
    setDraftFor(base)
    setDraft(base)
  }

  const dirty = draft != null && JSON.stringify(draft) !== JSON.stringify(base)

  function switchTo(key) {
    if (dirty && !window.confirm('You have unsaved changes in this section. Discard them?')) return
    setActiveKey(key)
  }

  async function save() {
    setSaving(true)
    const value = cleanSection(section, draft)
    const { data, error } = await supabase.from('site_content').upsert({ key: activeKey, value }).select().single()
    setSaving(false)
    if (error) return toast(error.message, 'error')
    clearContentCache()
    setRows((r) => ({ ...r, [activeKey]: data }))
    toast(`${section.title} saved. It’s live now.`)
  }

  async function reset() {
    if (!window.confirm(`Reset “${section.title}” to the built-in default text?`)) return
    const { error } = await supabase.from('site_content').delete().eq('key', activeKey)
    if (error) return toast(error.message, 'error')
    clearContentCache()
    setRows((r) => {
      const next = { ...r }
      delete next[activeKey]
      return next
    })
    toast('Reset to default')
  }

  return (
    <>
      <PageHeader title="Site content" description="Edit any section of the site. Saved changes go live for visitors right away." />
      {!rows ? (
        <p className="text-mute">Loading…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Sections" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => switchTo(s.key)}
                aria-current={s.key === activeKey ? 'true' : undefined}
                className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-[0.88rem] transition-colors ${s.key === activeKey ? 'bg-blood/15 text-bone shadow-[inset_2px_0_0_var(--color-blood)]' : 'text-bone/70 hover:bg-bone/[0.04] hover:text-bone'}`}
              >
                {s.title}
                {rows[s.key] && <span className="h-1.5 w-1.5 rounded-full bg-blood" title="Customised" />}
              </button>
            ))}
          </nav>

          <Card>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="text-[1.25rem] tracking-[-0.02em]">{section.title}</h2>
                <p className="mt-1 text-[0.85rem] text-mute">
                  {section.description ? `${section.description} ` : ''}
                  {stored ? `Last saved ${new Date(stored.updated_at).toLocaleString()}.` : 'Showing the built-in default.'}
                </p>
              </div>
              <div className="flex gap-2">
                {stored && <Button variant="plain" size="sm" onClick={reset}>Reset to default</Button>}
                <Button onClick={save} disabled={saving || !dirty}>{saving && <Spinner />}{dirty ? 'Save section' : 'Saved'}</Button>
              </div>
            </div>

            {draft != null && (
              <>
                {section.list && <ListEditor item={section.list.item} itemTitle={section.list.itemTitle} value={draft} onChange={setDraft} prefix={section.key} />}
                {section.lines && (
                  <Field label={section.lines.label} hint={section.lines.hint} htmlFor={section.key}>
                    <FieldInput field={{ type: 'lines' }} id={section.key} value={draft} onChange={setDraft} />
                  </Field>
                )}
                {section.fields && <Fields fields={section.fields} value={draft} onChange={setDraft} prefix={section.key} />}
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
