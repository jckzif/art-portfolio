import { NextResponse } from 'next/server';
import { getPublishedProject } from '@/lib/data';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const project = await getPublishedProject(slug);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ title: project.title, description: project.description || '' });
}
