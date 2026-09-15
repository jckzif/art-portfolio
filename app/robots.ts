import type { MetadataRoute } from 'next';

function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'https://jackzif.art';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${base}/sitemap.xml` };
}
