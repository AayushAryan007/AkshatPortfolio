# Akshat Aryan — Portfolio

Cinematic portfolio for a video editor & visual designer, with a Supabase-backed admin panel.

- **Site:** React 19 + Vite, Tailwind CSS v4, GSAP (ScrollTrigger) and Lenis smooth scrolling.
- **Videos:** YouTube and Instagram links play inline in a lightbox on the site.
- **Admin (`/admin`):** add, reorder, hide and delete videos and reels, and edit every section of the site.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the two Supabase values
npm run dev
```

Without the Supabase values the site still runs on the built-in defaults in `src/data/content.js`. The admin panel then shows setup instructions.

## Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor:** paste all of `supabase/migrations/20261125000000_init.sql` and run it. This creates the tables, security rules and the `media` storage bucket.
3. **Authentication → Sign In / Providers:** turn off *Allow new users to sign up*.
4. **Authentication → Users → Add user:** create the admin with an email listed in `admin_allowlist` (`akshat.avi1288@gmail.com` by default) and a password.
5. **Authentication → URL Configuration:** set the Site URL to the live domain and add `https://<domain>/admin/reset-password` to the redirect URLs, so password-reset emails work.
6. **Project Settings → API Keys:** copy the Project URL and the publishable key into `.env.local` (and into Vercel).

To give another email admin rights, run this in the SQL Editor:

```sql
insert into public.admin_allowlist (email) values ('someone@example.com');
```

Then create that user under Authentication → Users.

## Deploy on Vercel

1. Import the GitHub repo in Vercel. The framework preset is **Vite**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under Environment Variables.
3. Deploy. `vercel.json` routes every path to the app and keeps `/admin` out of search engines.

## Where things live

| What | Where |
| --- | --- |
| Default copy and placeholder videos | `src/data/content.js` |
| Site sections | `src/sections/` |
| Admin panel | `src/admin/` |
| Editable section definitions | `src/admin/content-schema.js` |
| Database schema | `supabase/migrations/` |
