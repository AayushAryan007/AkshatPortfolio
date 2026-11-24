// Default copy for every section of the site.
// Later the admin panel will override these from Supabase; anything not edited
// there falls back to the values below. Values marked PLACEHOLDER need real data.

export const profile = {
  firstName: 'AKSHAT',
  lastName: 'ARYAN',
  brand: 'THE CINEMA', // PLACEHOLDER — pick a brand mark (see options)
  tagline: 'Digital Creator',
  roles: ['Video Editor', 'Visual Designer'],
  intro:
    'I cut, colour and design stories that stop the scroll. From cinematic long-form to punchy reels, I obsess over rhythm, pacing and the frame-perfect detail that makes people feel something.', // PLACEHOLDER
  badge: 'Turning raw footage into powerful visual stories.',
  location: 'Noida, India · Available worldwide',
  available: true,
  photo: '/assets/img/akshat-hero.jpg',
  signature: 'Akshat',
}

export const stats = [
  { value: 1, suffix: '+', label: 'Year experience' },
  { value: 50, suffix: '+', label: 'Videos edited' },
  { value: 5, suffix: '+', label: 'Happy clients' },
]

export const marquee = [
  'Video Editing',
  'Motion Graphics',
  'Colour Grading',
  'Sound Design',
  'Short-Form Reels',
  'YouTube Edits',
  'Thumbnails',
  'Brand Design',
]

// Portfolio videos. Paste any YouTube (watch / youtu.be / shorts) or Instagram
// (reel / post) link in `url` — the site detects the platform, pulls the
// thumbnail where possible and plays it inline in a lightbox.
// While `url` is empty the card renders as a styled placeholder.
// `format`: 'landscape' (16:9) or 'vertical' (9:16). Auto-detected if omitted.
export const videos = [
  { id: 'v1', title: 'Project Title One', category: 'Music Video', client: 'Client name', year: '2025', url: '', featured: true },
  { id: 'v2', title: 'Project Title Two', category: 'Brand Film', client: 'Client name', year: '2025', url: '' },
  { id: 'v3', title: 'Project Title Three', category: 'YouTube Long-Form', client: 'Client name', year: '2024', url: '' },
  { id: 'v4', title: 'Project Title Four', category: 'Documentary', client: 'Client name', year: '2024', url: '' },
  { id: 'v5', title: 'Project Title Five', category: 'Commercial', client: 'Client name', year: '2024', url: '' },
  { id: 'r1', title: 'Reel One', category: 'Instagram Reel', url: '', format: 'vertical' },
  { id: 'r2', title: 'Reel Two', category: 'YouTube Short', url: '', format: 'vertical' },
  { id: 'r3', title: 'Reel Three', category: 'Instagram Reel', url: '', format: 'vertical' },
  { id: 'r4', title: 'Reel Four', category: 'Instagram Reel', url: '', format: 'vertical' },
  { id: 'r5', title: 'Reel Five', category: 'YouTube Short', url: '', format: 'vertical' },
]

export const showreel = {
  // PLACEHOLDER — your main showreel link (YouTube or Instagram)
  url: '',
  label: 'Showreel 2026',
  duration: '01:24',
}

export const education = [
  { title: 'B.Com (Honours)', place: 'Bachelor of Commerce', year: '' },
  { title: 'Blender 3D', place: 'Self-learning · 3D & motion', year: 'Learning now' },
]

export const skills = [
  'Premiere Pro',
  'After Effects',
  'DaVinci Resolve',
  'Blender · Learning',
  'Colour Grading',
  'Motion Graphics',
  'Sound Design',
  'Storytelling',
]

export const process = [
  { title: 'Brief', text: 'Understanding the goal, the audience and the feeling the video must leave behind.' },
  { title: 'Plan', text: 'Script, references, moodboards and a cut structure before touching the timeline.' },
  { title: 'Edit', text: 'Rhythm, pacing, transitions and motion — building the story shot by shot.' },
  { title: 'Grade & Sound', text: 'Colour, sound design and mix that give the piece its cinematic finish.' },
  { title: 'Deliver', text: 'Revisions, platform-ready exports and a final cut delivered on time.' },
]

export const quote = {
  text: 'A great edit isn’t what you see — it’s what you feel between the cuts.',
  cta: 'Let’s create something unforgettable together.',
}

export const contact = {
  heading: ['LET’S WORK', 'TOGETHER'],
  text: 'I’m currently open for new projects and collaborations. Got footage, an idea or a brand to build? Let’s make something that moves people.',
  email: 'akshat.avi1288@gmail.com',
  website: '', // added later from the admin panel
  phone: '+91 82870 33233',
  location: 'Noida, India',
}

export const socials = [
  // Links are added from the admin panel; entries with an empty url are hidden.
  { label: 'Instagram', url: '' },
  { label: 'YouTube', url: '' },
  { label: 'LinkedIn', url: '' },
  { label: 'Behance', url: '' },
]

export const nav = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'reels', label: 'Reels' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]
