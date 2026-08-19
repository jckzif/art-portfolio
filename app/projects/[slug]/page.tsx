import type { Metadata } from 'next'; import { notFound } from 'next/navigation'; import { getPublishedProject } from '@/lib/data'; import { formatProjectDate } from '@/lib/utils'; import { ProjectViewer } from '@/components/project-viewer';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const p = await getPublishedProject((await params).slug); return p ? { title: p.title, description: p.description || `Artwork from ${p.title}` } : {}; }
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
	const project = await getPublishedProject((await params).slug);
	if (!project) notFound();

	const date = formatProjectDate(project.project_date);
	const headerLine = `${project.title} / ${date} / ${project.description || 'No description'}`;

	return (
		<main className="page portfolio-screen">
			{/* in-page header removed — site header at top is authoritative */}
			<ProjectViewer images={project.project_images || []} title={project.title} />
		</main>
	);
}
