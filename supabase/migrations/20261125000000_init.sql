-- =============================================================================
-- Akshat Aryan portfolio: initial schema
--
-- Run once in Supabase → SQL Editor (paste the whole file, then Run).
-- Access model (Row Level Security):
--   • Visitors (anon) can read site content and published videos.
--   • Admins (emails in admin_allowlist) can read and write everything.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admins
-- -----------------------------------------------------------------------------

-- Emails allowed to become admins. Turn off sign-ups in Supabase Auth and
-- create the account by hand; this list decides who gets admin rights.
create table public.admin_allowlist (
  email text primary key
);

insert into public.admin_allowlist (email) values
  ('akshat.avi1288@gmail.com');

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- True when the current request belongs to an admin. SECURITY DEFINER lets
-- policies call it without granting read access on the admins table itself.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- When an allowlisted email gets an account, register it as an admin.
create function public.register_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.admin_allowlist where lower(email) = lower(new.email)) then
    insert into public.admins (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.register_admin();

-- Backfill: accounts created before this script ran.
insert into public.admins (user_id, email)
select u.id, lower(u.email)
from auth.users u
join public.admin_allowlist a on lower(a.email) = lower(u.email)
on conflict (user_id) do nothing;

-- -----------------------------------------------------------------------------
-- Site content: one JSON value per section (profile, stats, skills, ...).
-- Missing keys fall back to the defaults in src/data/content.js.
-- -----------------------------------------------------------------------------
create table public.site_content (
  key text primary key check (key ~ '^[a-z_]{2,40}$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Videos: YouTube / Instagram links played inline on the site.
--   format 'landscape' → Selected Work grid (16:9)
--   format 'vertical'  → Reels & Shorts carousel (9:16)
-- -----------------------------------------------------------------------------
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  category text check (char_length(category) <= 60),
  client text check (char_length(client) <= 80),
  year text check (char_length(year) <= 20),
  url text not null check (url ~ '^https?://' and char_length(url) <= 500),
  format text not null default 'landscape' check (format in ('landscape', 'vertical')),
  cover_path text check (char_length(cover_path) <= 300),
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index videos_public_idx on public.videos (is_published, format, sort_order, created_at desc);

create trigger videos_touch
  before update on public.videos
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.admin_allowlist enable row level security;
alter table public.admins enable row level security;
alter table public.site_content enable row level security;
alter table public.videos enable row level security;

-- admin_allowlist: no policies, so only the SQL editor can change it.

-- admins: a signed-in user can see their own row (used to check admin status).
create policy "admins read own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- site_content
create policy "content public read" on public.site_content
  for select to anon, authenticated
  using (true);
create policy "content admin all" on public.site_content
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- videos: visitors see published videos only.
create policy "videos public read" on public.videos
  for select to anon, authenticated
  using (is_published);
create policy "videos admin all" on public.videos
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- =============================================================================
-- API grants. Explicit so the schema works even when "Grant API access to new
-- tables automatically" is off. RLS above still decides which rows each role sees.
-- =============================================================================
grant usage on schema public to anon, authenticated;
grant select on public.site_content, public.videos to anon, authenticated;
grant insert, update, delete on public.site_content, public.videos to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- =============================================================================
-- Storage: one public bucket for photos and video covers (10 MB per file)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do nothing;

-- Files are served through public URLs; only admins can list, upload, change or delete.
create policy "media admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
