import { createClient } from './supabase/server';
import type { Project } from './types';
export { imageUrl } from './images';
export async function getPublishedProjects(): Promise<Project[]> { const db = await createClient(); const { data, error } = await db.from('projects').select('*, project_images!project_images_project_id_fkey(*)').eq('published', true).order('project_date', { ascending: false, nullsFirst: false }); if (error) throw new Error(`Supabase could not load projects: ${error.message}`); return data as Project[]; }
export async function getPublishedProject(slug: string): Promise<Project | null> { const db = await createClient(); const { data, error } = await db.from('projects').select('*, project_images!project_images_project_id_fkey(*)').eq('slug', slug).eq('published', true).single(); if (error) return null; const p = data as Project; p.project_images?.sort((a,b) => a.sort_order - b.sort_order); return p; }
