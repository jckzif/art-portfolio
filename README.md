# Jack's Portfolio

A minimal digital-art portfolio built with Next.js App Router, TypeScript, Tailwind CSS, Supabase Postgres/Auth/Storage, and Vercel-compatible conventions.

## Included

- Published/draft projects with editable, unique slugs and public `/projects/[slug]` URLs.
- Responsive editorial project grid, optimized Supabase images, metadata, sitemap, and robots rules.
- Artwork viewer with controls, keyboard navigation, mobile swipes, caption, counter, and fullscreen mode.
- Authenticated admin workflow for projects, multi-file uploads, captions/alt text, covers, drag reorder, and deletion.
- Database constraints, Row Level Security, storage MIME/size limits, and no client-side secret key.

## Install and configure

Use Node 20.9+ (Node 22 recommended), then run:

```bash
npm install
cp .env.example .env.local
```

Create a Supabase project and add its Project URL and anon/publishable key to `.env.local`. Set `NEXT_PUBLIC_SITE_URL` to the final deployed URL in production. Never add a service-role key to this app.

## Supabase setup

Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It creates tables, indexes, Row Level Security policies, the public `artwork` bucket, and MIME/size restrictions.

Enable Email authentication in Supabase, create (or invite) your first user, then run the final commented `update auth.users ...` command in `schema.sql` after replacing the email. Sign out and in again so the admin role claim refreshes.

## Local use

```bash
npm run dev
```

Sign in at `/login`, open `/admin/projects`, save a project, upload artwork, reorder it, write captions, choose a cover, then publish. Published work appears at its slug URL.

## Deploy to Vercel

Push to Git and import the repository in Vercel. Add the three values listed in `.env.example` as Vercel environment variables, set `NEXT_PUBLIC_SITE_URL` to the production HTTPS URL, and redeploy. Add the URL to Supabase Auth redirect URLs if adding magic-link or OAuth sign-in.

## Validation

The UI and bucket allow JPEG, PNG, WebP, and AVIF up to 20 MB. Artwork uses `object-contain` to preserve aspect ratio. No demo content ships. Before launch, run `npm run typecheck` and `npm run build`, then verify the full editor flow against your Supabase project. This workspace has no Supabase credentials, so external integration testing must happen after setup.
