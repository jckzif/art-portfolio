import type { Metadata } from 'next';
import Image from 'next/image';
import { getAboutContent } from '@/lib/data';

export const metadata: Metadata = { title: 'About' };
export const dynamic = 'force-dynamic';

// converts [text](url) markdown links to anchor tags
function renderText(text: string) {
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (m) return <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="underline">{m[1]}</a>;
    return <span key={i}>{part}</span>;
  });
}

export default async function About() {
  const about = await getAboutContent();

  return (
    <main className="page py-16">
      <h1 className="display text-5xl mb-12">About</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {about?.image_path && (
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 lg:col-span-1">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${about.image_path}`}
              alt="About"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, 100vw"
            />
          </div>
        )}
        <div className={`flex flex-col gap-8 lg:col-span-${about?.image_path ? '2' : '3'}`}>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {(about?.left_text || !about) && (
              <div className="text-lg leading-relaxed text-stone-700 whitespace-pre-wrap">
                {about?.left_text
                  ? renderText(about.left_text)
                  : 'Artist statement goes here. You can add links like [example](https://example.com).'}
              </div>
            )}
            {(about?.right_text || !about) && (
              <div className="text-lg leading-relaxed text-stone-700 whitespace-pre-wrap">
                {about?.right_text
                  ? renderText(about.right_text)
                  : 'Contact and additional information goes here.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
