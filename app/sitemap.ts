import type { MetadataRoute } from 'next'; import { getPublishedProjects } from '@/lib/data';

function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'https://jackzif.art';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const projects = await getPublishedProjects();
  return [{ url: base, lastModified: new Date() }, { url: `${base}/about`, lastModified: new Date() }, ...projects.map(p => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updated_at }))];
}
