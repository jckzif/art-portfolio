import Image from 'next/image';
import Link from 'next/link';
import { getPublishedProjects, imageUrl, getAndIncrementVisitCount, getTotalImageCount } from '@/lib/data';
import { formatProjectDate } from '@/lib/utils';

export const revalidate = 60;

export default async function Home() {
  const projects = await getPublishedProjects();
  const regularProjects = projects.filter(p => !p.is_notebook);
  const visitCount = await getAndIncrementVisitCount();
  const totalImages = await getTotalImageCount();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jack',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://jackzif.art',
    jobTitle: 'Digital Artist',
    description: "Jack's digital art portfolio showcasing digital artwork.",
  };

  return (
    <main className="page portfolio-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">Jack&apos;s Portfolio — Work</h1>
      <div className="fixed right-2 sm:right-3 lg:right-5 bottom-2 sm:bottom-3 lg:bottom-5 z-50 pointer-events-auto text-xs text-stone-500 flex gap-3 sm:gap-4 bg-white/80 sm:bg-transparent px-2 sm:px-0 py-1 sm:py-0 rounded sm:rounded-none">
        <div>{totalImages} piece{totalImages !== 1 ? 's' : ''}</div>
        <div>{visitCount} visit{visitCount !== 1 ? 's' : ''}</div>
      </div>
      {regularProjects.length === 0 ? (
        <div className="py-10 sm:py-20">
          <p className="text-2xl sm:text-3xl">No published work yet.</p>
          <p className="mt-2 text-base sm:text-lg">Your published projects will appear here.</p>
        </div>
      ) : (
        <div className="grid max-w-6xl grid-cols-1 gap-x-2 gap-y-4 sm:gap-x-5 sm:gap-y-10 pt-4 sm:pt-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {regularProjects.map((project) => {
            const cover = project.project_images?.find(i => i.id === project.cover_image_id) || project.project_images?.[0];
            return (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group block no-underline">
                <div className="relative aspect-video overflow-hidden bg-white">
                  {cover ? (
                    <Image
                      src={imageUrl(cover.storage_path)}
                      alt={cover.alt_text || project.title}
                      fill
                      sizes="(min-width: 1280px) 16vw, (min-width: 640px) 28vw, 45vw"
                      className="object-cover gentle group-hover:scale-[1.015]"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-sm">No artwork</span>
                  )}
                </div>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <h2 className="text-xl leading-none">{project.title}</h2>
                  <time className="shrink-0 text-sm">{formatProjectDate(project.project_date)}</time>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
