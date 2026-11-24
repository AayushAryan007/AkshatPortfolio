/*
 * Describes every editable section of the site, so the editor can build its
 * forms automatically. `key` is the row in the site_content table; `name` is
 * the matching export in src/data/content.js (the defaults).
 *
 * Field types: text, textarea, url, email, number, toggle, lines (one item per
 * line), tags (comma-separated), group, list (repeatable items), image (upload).
 * A section is either `fields` (an object), `list` (array of objects) or
 * `lines` (array of strings).
 */

export const sections = [
  {
    key: 'profile',
    name: 'profile',
    title: 'Profile & hero',
    description: 'Your name, roles, intro and the hero photo.',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', hint: 'Shown big and solid.' },
      { name: 'lastName', label: 'Last name', type: 'text', hint: 'Shown big as an outline.' },
      { name: 'brand', label: 'Brand mark (top-left)', type: 'text' },
      { name: 'tagline', label: 'Brand subtitle', type: 'text' },
      { name: 'roles', label: 'Roles', type: 'lines', hint: 'One per line. Joined with “&” in red under your name.' },
      { name: 'intro', label: 'Intro paragraph', type: 'textarea' },
      { name: 'badge', label: 'Badge text (beside the photo)', type: 'text' },
      { name: 'location', label: 'Location line', type: 'text' },
      { name: 'signature', label: 'Signature (handwritten)', type: 'text' },
      { name: 'available', label: 'Show “Available for freelance”', type: 'toggle' },
      { name: 'photo', label: 'Hero photo', type: 'image', folder: 'profile', hint: 'A dark, portrait photo works best (it fades into the black background).' },
    ],
  },
  {
    key: 'stats',
    name: 'stats',
    title: 'Hero stats',
    description: 'The red counters on the right of the hero. Three fit best.',
    list: {
      itemTitle: 'label',
      item: [
        { name: 'value', label: 'Number', type: 'number' },
        { name: 'suffix', label: 'Suffix', type: 'text', hint: 'e.g. +' },
        { name: 'label', label: 'Label', type: 'text' },
      ],
    },
  },
  {
    key: 'showreel',
    name: 'showreel',
    title: 'Showreel',
    description: 'The big “SHOW ▶ REEL” block and the “Play showreel” button.',
    fields: [
      { name: 'url', label: 'Showreel link', type: 'url', hint: 'YouTube or Instagram link.' },
      { name: 'label', label: 'Title', type: 'text' },
      { name: 'duration', label: 'Duration', type: 'text', hint: 'e.g. 01:24' },
    ],
  },
  {
    key: 'marquee',
    name: 'marquee',
    title: 'Moving strip',
    description: 'Words in the two swaying red / outline strips.',
    lines: { label: 'Words', hint: 'One per line.' },
  },
  {
    key: 'education',
    name: 'education',
    title: 'Education',
    list: {
      itemTitle: 'title',
      item: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'place', label: 'Institute / detail', type: 'text' },
        { name: 'year', label: 'Year', type: 'text', hint: 'Optional.' },
      ],
    },
  },
  {
    key: 'skills',
    name: 'skills',
    title: 'Skills',
    description: 'The chips under Toolkit & Skills. Include “Learning” in a skill to give it the dashed, blinking style.',
    lines: { label: 'Skills', hint: 'One per line.' },
  },
  {
    key: 'process',
    name: 'process',
    title: 'Work process',
    list: {
      itemTitle: 'title',
      item: [
        { name: 'title', label: 'Step', type: 'text' },
        { name: 'text', label: 'Description', type: 'textarea' },
      ],
    },
  },
  {
    key: 'quote',
    name: 'quote',
    title: 'Quote panel',
    fields: [
      { name: 'text', label: 'Quote', type: 'textarea' },
      { name: 'cta', label: 'Small line at the bottom', type: 'text' },
    ],
  },
  {
    key: 'contact',
    name: 'contact',
    title: 'Contact',
    description: 'Empty fields are hidden on the site.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'lines', hint: 'One line per row.' },
      { name: 'text', label: 'Text', type: 'textarea' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'website', label: 'Website', type: 'text', hint: 'e.g. www.yoursite.com' },
      { name: 'location', label: 'Location', type: 'text' },
    ],
  },
  {
    key: 'socials',
    name: 'socials',
    title: 'Social links',
    description: 'Shown in the contact section and the menu. Items without a link are hidden.',
    list: {
      itemTitle: 'label',
      item: [
        { name: 'label', label: 'Name', type: 'text', hint: 'e.g. Instagram' },
        { name: 'url', label: 'Link', type: 'url' },
      ],
    },
  },
]

/** Blank value for a new list item. */
export function blankItem(fields) {
  return Object.fromEntries(fields.map((f) => [f.name, f.type === 'number' ? 0 : f.type === 'toggle' ? false : f.type === 'lines' || f.type === 'tags' ? [] : '']))
}

/** Trim strings and drop empty entries from line/tag arrays before saving. */
export function clean(value, field) {
  switch (field.type) {
    case 'lines':
    case 'tags':
      return (value ?? []).map((s) => String(s).trim()).filter(Boolean)
    case 'number': {
      const n = Number(value)
      return Number.isFinite(n) ? n : 0
    }
    case 'toggle':
      return Boolean(value)
    case 'group':
      return cleanFields(value ?? {}, field.fields)
    case 'list':
      return (value ?? []).map((v) => cleanFields(v, field.item))
    default:
      return typeof value === 'string' ? value.trim() : value
  }
}

export function cleanFields(obj, fields) {
  const out = { ...obj }
  fields.forEach((f) => { out[f.name] = clean(obj[f.name], f) })
  return out
}

export function cleanSection(section, value) {
  if (section.list) return clean(value, { type: 'list', item: section.list.item })
  if (section.lines) return clean(value, { type: 'lines' })
  return cleanFields(value, section.fields)
}
