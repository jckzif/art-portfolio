import type { Metadata } from 'next'; import { Suspense } from 'react'; import './globals.css'; import { SiteHeader } from '@/components/site-header'; import { DynamicFavicon } from '@/components/dynamic-favicon'; import { getAboutContent } from '@/lib/data';
function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://jackzif.art';
  // ensure the value always has a scheme so new URL() doesn't throw
  return raw.startsWith('http') ? raw : `https://${raw}`;
}
export const metadata: Metadata = { title: { default: 'jacks art portfolio', template: '%s — jacks art portfolio' }, description: "Jack's digital art portfolio.", metadataBase: new URL(siteUrl()) };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const about = await getAboutContent();
  const faviconUrl = about?.favicon_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${about.favicon_path}`
    : undefined;
  return <html lang="en"><body><DynamicFavicon src={faviconUrl} /><Suspense fallback={<header className="page py-5"><span className="text-xl">jacks art portfolio</span></header>}><SiteHeader /></Suspense>{children}</body></html>; }
