import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedProject, imageUrl } from '@/lib/data';
import { formatProjectDate } from '@/lib/utils';
import { ProjectViewer } from '@/components/project-viewer';
import { ProjectInfoButton } from '@/components/project-info-button';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPublishedProject((await params).slug);
  if (!p) return {};
  
  const cover = p.project_images?.find(i => i.id === p.cover_image_id) || p.project_images?.[0];
  const coverImageUrl = cover ? imageUrl(cover.storage_path) : undefined;
  
  return {
    title: p.title,
    description: p.description || `Artwork from ${p.title}`,
    openGraph: {
      title: p.title,
      description: p.description || `Artwork from ${p.title}`,
      type: 'website',
      images: coverImageUrl ? [{ url: coverImageUrl, width: 1200, height: 900, alt: p.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description: p.description || `Artwork from ${p.title}`,
      images: coverImageUrl ? [coverImageUrl] : [],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
	const project = await getPublishedProject((await params).slug);
	if (!project) notFound();

	const date = formatProjectDate(project.project_date);
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: project.title,
		description: project.description || `Artwork from ${project.title}`,
		dateCreated: project.project_date,
		url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jackzif.art'}/projects/${project.slug}`,
		image: project.project_images?.[0]?.storage_path
			? imageUrl(project.project_images[0].storage_path)
			: undefined,
	};

	return (
		<main className="page portfolio-screen">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="flex items-center gap-1 py-4 sm:py-6 border-b border-stone-200">
				<h1 className="text-xl sm:text-2xl">{project.title}</h1>
				<span className="text-stone-400">/</span>
				<span className="text-sm sm:text-base text-stone-600">{date}</span>
				{project.description && (
					<ProjectInfoButton
						title={project.title}
						date={date}
						description={project.description}
					/>
				)}
			</div>
			<ProjectViewer images={project.project_images || []} title={project.title} />
		</main>
	);
}
