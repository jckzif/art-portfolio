import { notFound } from 'next/navigation';
import { createClient, hasSupabaseConfig } from '@/lib/supabase/server';
import { ProjectEditor } from '@/components/project-editor';
import type { Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseConfig()) notFound();

  const db = await createClient();
  const { data } = await db
    .from('projects')
    .select('*, project_images!project_images_project_id_fkey(*)')
    .eq('id', (await params).id)
    .single();

  if (!data) notFound();
  return <ProjectEditor initial={data as Project} />;
}
