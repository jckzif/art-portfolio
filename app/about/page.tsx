import type { Metadata } from 'next';
import Image from 'next/image';
import { getAboutContent } from '@/lib/data';

export const metadata: Metadata = { title: 'About' };
export const dynamic = 'force-dynamic';

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
  const hasImage = !!about?.image_path;
  const imgSrc = hasImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${about!.image_path}`
    : null;

  return (
    <main className="page py-8 sm:py-16 max-w-5xl">
      <h1 className="display text-3xl sm:text-5xl mb-8 sm:mb-12">About</h1>

      {hasImage ? (
        <div className="flex flex-col gap-6 sm:gap-10 lg:flex-row lg:gap-16">
          <div className="relative w-full sm:w-96 lg:w-72 shrink-0 aspect-[3/4] overflow-hidden bg-stone-100">
            <Image src={imgSrc!} alt="About" fill className="object-cover" sizes="(min-width: 1024px) 288px, (min-width: 640px) 384px, 100vw" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 flex-1">
            {about?.left_text && (
              <p className="text-base sm:text-lg leading-relaxed text-stone-700 whitespace-pre-wrap">{renderText(about.left_text)}</p>
            )}
            {about?.right_text && (
              <p className="text-base sm:text-lg leading-relaxed text-stone-700 whitespace-pre-wrap">{renderText(about.right_text)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 max-w-4xl">
          <p className="text-base sm:text-lg leading-relaxed text-stone-700 whitespace-pre-wrap">
            {about?.left_text ? renderText(about.left_text) : 'Artist statement goes here. Add links like [example](https://example.com).'}
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-stone-700 whitespace-pre-wrap">
            {about?.right_text ? renderText(about.right_text) : 'Contact and additional information goes here.'}
          </p>
        </div>
      )}
    </main>
  );
}
