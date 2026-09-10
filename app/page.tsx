import Image from 'next/image';
import Link from 'next/link';
import { getPublishedProjects, imageUrl, getAndIncrementVisitCount, getTotalImageCount } from '@/lib/data';
import { formatProjectDate } from '@/lib/utils';

export const revalidate = 60;

export default async function Home() {
  const projects = await getPublishedProjects();
  const notebook = projects.find(p => p.is_notebook);
  const regularProjects = projects.filter(p => !p.is_notebook);
  const visitCount = await getAndIncrementVisitCount();
  const totalImages = await getTotalImageCount();

  return (
    <main className="page portfolio-screen flex flex-col">
      <h1 className="sr-only">Jack&apos;s Portfolio — Work</h1>
      <div className="border-b border-stone-300 bg-stone-50 py-3 text-xs text-stone-500">
        <div className="page flex items-center justify-between gap-4">
          <span>{totalImages} piece{totalImages !== 1 ? 's' : ''}</span>
          <span>{visitCount} visit{visitCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {notebook && (
        <div className="border-b border-stone-300 bg-white">
          <div className="page flex items-center py-4">
            <Link href={`/projects/${notebook.slug}`} className="text-lg font-medium no-underline hover:underline">
              {notebook.title}
            </Link>
          </div>
        </div>
      )}
      {regularProjects.length === 0 ? (
        <div className="py-20">
          <p className="text-3xl">No published work yet.</p>
          <p className="mt-2 text-lg">Your published projects will appear here.</p>
        </div>
      ) : (
        <div className="grid max-w-6xl grid-cols-2 gap-x-5 gap-y-10 pt-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {regularProjects.map((project) => {
            const cover = project.project_images?.find(i => i.id === project.cover_image_id) || project.project_images?.[0];
            return (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group block no-underline">
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
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
