import type { Metadata } from 'next'; import { Suspense } from 'react'; import './globals.css'; import { SiteHeader } from '@/components/site-header';
function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  // ensure the value always has a scheme so new URL() doesn't throw
  return raw.startsWith('http') ? raw : `https://${raw}`;
}
export const metadata: Metadata = { title: { default: "Jack's Portfolio", template: "%s — Jack's Portfolio" }, description: "Jack's digital art portfolio.", metadataBase: new URL(siteUrl()) };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Suspense fallback={<header className="page py-5"><span className="text-xl">Jack&apos;s Portfolio</span></header>}><SiteHeader /></Suspense>{children}</body></html>; }
