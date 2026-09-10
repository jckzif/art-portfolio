import { createClient, hasSupabaseConfig } from './supabase/server';
import type { Project } from './types';

export { imageUrl } from './images';

export type AboutContent = { id: number; left_text: string; right_text: string; image_path: string | null; favicon_path: string | null; updated_at: string };

export async function getAboutContent(): Promise<AboutContent | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    const db = await createClient();
    const { data } = await db.from('about_content').select('*').eq('id', 1).single();
    return data as AboutContent | null;
  } catch {
    return null;
  }
}

export async function getPublishedProjects(): Promise<Project[]> {
  if (!hasSupabaseConfig()) return [];

  try {
    const db = await createClient();
    const { data, error } = await db
      .from('projects')
      .select('*, project_images!project_images_project_id_fkey(*)')
      .eq('published', true)
      .order('project_date', { ascending: false, nullsFirst: false });

    if (error) throw new Error(`Supabase could not load projects: ${error.message}`);
    return data as Project[];
  } catch {
    return [];
  }
}

export async function getPublishedProject(slug: string): Promise<Project | null> {
  if (!hasSupabaseConfig()) return null;

  try {
    const db = await createClient();
    const { data, error } = await db
      .from('projects')
      .select('*, project_images!project_images_project_id_fkey(*)')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) return null;
    const p = data as Project;
    p.project_images?.sort((a, b) => a.sort_order - b.sort_order);
    return p;
  } catch {
    return null;
  }
}

export async function getAndIncrementVisitCount(): Promise<number> {
  if (!hasSupabaseConfig()) return 0;

  try {
    const db = await createClient();
    const { data, error } = await db.rpc('increment_visit_count');

    if (error) {
      console.error('Failed to increment visit count:', error);
      // Fall back to just reading the current count
      const { data: stats } = await db
        .from('visit_stats')
        .select('visit_count')
        .eq('id', 1)
        .single();
      return (stats as { visit_count: number })?.visit_count || 0;
    }
    return data as number;
  } catch (e) {
    console.error('Visit count error:', e);
    return 0;
  }
}

export async function getTotalImageCount(): Promise<number> {
  if (!hasSupabaseConfig()) return 0;

  try {
    const db = await createClient();
    const projects = await getPublishedProjects();
    const total = projects.reduce((sum, p) => sum + (p.project_images?.length || 0), 0);
    return total;
  } catch {
    return 0;
  }
}
