'use client';
import { useEffect, useMemo, useState } from 'react'; import { useRouter } from 'next/navigation'; import Image from 'next/image'; import { createClient } from '@/lib/supabase/client'; import { allowedImageTypes, maxImageBytes, slugify } from '@/lib/utils'; import { imageUrl } from '@/lib/images'; import type { Project, ProjectImage } from '@/lib/types';
type Draft = Pick<Project, 'title'|'slug'|'description'|'project_date'|'cover_image_id'|'published'>;
const empty: Draft = { title: '', slug: '', description: '', project_date: null, cover_image_id: null, published: false };
export function ProjectEditor({ initial }: { initial?: Project }) { const db = useMemo(createClient, []); const router = useRouter(); const [project, setProject] = useState<Project | null>(initial || null); const [form, setForm] = useState<Draft>(initial ? { title: initial.title, slug: initial.slug, description: initial.description, project_date: initial.project_date, cover_image_id: initial.cover_image_id, published: initial.published } : empty); const [images, setImages] = useState<ProjectImage[]>(initial?.project_images || []); const [saving, setSaving] = useState(false); const [message, setMessage] = useState(''); const [dragged, setDragged] = useState<string | null>(null);
 useEffect(() => { if (!initial) return; db.from('project_images').select('*').eq('project_id', initial.id).order('sort_order').then(({ data }) => setImages((data || []) as ProjectImage[])); }, [db, initial]);
 const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm(f => ({ ...f, [key]: value }));
 async function save() {
	setSaving(true);
	setMessage('');
	const payload = { ...form, title: form.title.trim(), slug: slugify(form.slug), description: form.description?.trim() || null };
	// Remove any undefined values to avoid sending unexpected keys to PostgREST
	const safePayload = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
	if (process.env.NODE_ENV === 'development') console.debug('Saving project payload', safePayload);
	let result;
	try {
		result = project
			? await db.from('projects').update(safePayload).eq('id', project.id).select().single()
			: await db.from('projects').insert(safePayload).select().single();
	} catch (e) {
		console.error('Supabase save threw:', e);
		setSaving(false);
		return setMessage(`Could not save: ${String(e)}`);
	}

	if (process.env.NODE_ENV === 'development') {
		console.debug('Supabase save result', result);
		if (result?.error && Object.keys(result.error).length === 0) console.warn('Supabase returned an empty error object — inspect the Network tab for the raw response');
		if (result?.error) console.error('Supabase save error details', result.error);
	}
	// Dev-only: if Supabase reported an error (or empty error), try the raw REST call
	// so we can capture the raw response body from PostgREST for diagnosis.
	if (process.env.NODE_ENV === 'development' && result?.error) {
		try {
			const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects${project ? `?id=eq.${project.id}` : ''}`;
			const method = project ? 'PATCH' : 'POST';
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
					Prefer: 'return=representation'
				},
				body: JSON.stringify(safePayload),
			});
			const text = await res.text();
			console.debug('Raw PostgREST response', { status: res.status, statusText: res.statusText, body: text });
		} catch (e) {
			console.error('Raw REST debug failed', e);
		}
	}
	setSaving(false);
	if (result.error) return setMessage(`Could not save: ${result.error.message}`);
	const saved = result.data as Project;
	setProject(saved);
	// Only copy Draft fields back into the form to avoid including relations like
	// `project_images` in subsequent update payloads (PostgREST will reject them).
	setForm({
		title: saved.title,
		slug: saved.slug,
		description: saved.description,
		project_date: saved.project_date,
		cover_image_id: saved.cover_image_id,
		published: saved.published,
	});
	setMessage('Saved.');
	if (!initial) router.replace(`/admin/projects/${result.data.id}`);
 }
 async function upload(files: FileList | null) { if (!project) return setMessage('Save the project before uploading artwork.'); if (!files?.length) return; setMessage('Uploading artwork…'); for (const file of Array.from(files)) { if (!allowedImageTypes.includes(file.type) || file.size > maxImageBytes) { setMessage(`${file.name}: use JPEG, PNG, WebP, or AVIF files up to 20 MB.`); continue; } const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'; const path = `${project.id}/${crypto.randomUUID()}.${extension}`; const { error: storageError } = await db.storage.from('artwork').upload(path, file, { contentType: file.type }); if (storageError) { setMessage(`Upload failed: ${storageError.message}`); continue; } const { data, error } = await db.from('project_images').insert({ project_id: project.id, storage_path: path, alt_text: `${project.title} artwork`, sort_order: images.length }).select().single(); if (error) { await db.storage.from('artwork').remove([path]); setMessage(`Could not save image: ${error.message}`); } else setImages(old => [...old, data as ProjectImage]); } setMessage('Upload complete.'); }
 async function saveImage(image: ProjectImage) { const { error } = await db.from('project_images').update({ caption: image.caption, alt_text: image.alt_text }).eq('id', image.id); if (error) setMessage(`Could not update artwork: ${error.message}`); else setMessage('Artwork details saved.'); }
 async function deleteImage(image: ProjectImage) { if (!confirm('Delete this artwork permanently?')) return; const { error } = await db.from('project_images').delete().eq('id', image.id); if (error) return setMessage(`Could not delete artwork: ${error.message}`); await db.storage.from('artwork').remove([image.storage_path]); setImages(items => items.filter(i => i.id !== image.id)); if (form.cover_image_id === image.id) update('cover_image_id', null); setMessage('Artwork deleted.'); }
 async function reorder(target: string) { if (!dragged || dragged === target) return; await moveImage(images.findIndex(i => i.id === dragged), images.findIndex(i => i.id === target)); setDragged(null); }
 async function moveImage(from: number, to: number) { if (from < 0 || to < 0 || from === to) return; const next = [...images]; const [moving] = next.splice(from, 1); next.splice(to, 0, moving); const ordered = next.map((i, sort_order) => ({ ...i, sort_order })); setImages(ordered); const { error } = await db.from('project_images').upsert(ordered.map(({ id, sort_order }) => ({ id, sort_order }))); if (error) setMessage(`Could not reorder: ${error.message}`); else setMessage('Artwork order saved.'); }
 async function removeProject() { if (!project || !confirm('Delete this entire project and all of its artwork?')) return; const paths = images.map(i => i.storage_path); const { error } = await db.from('projects').delete().eq('id', project.id); if (error) return setMessage(`Could not delete project: ${error.message}`); if (paths.length) await db.storage.from('artwork').remove(paths); router.replace('/admin/projects'); }
 return <><div className="flex items-start justify-between gap-4"><div><h1 className="display text-4xl">{project ? 'Edit project' : 'New project'}</h1><p className="mt-2 text-stone-600">{project ? 'Changes are visible on the public site after publishing.' : 'Start with the basic information, then upload artwork.'}</p></div>{project && <button onClick={removeProject} className="text-sm text-red-700">Delete project</button>}</div><div aria-live="polite" className="mt-5 text-sm text-stone-600">{message}</div><section className="mt-8 max-w-2xl border-t border-stone-300 pt-6"><div className="grid gap-5"><label>Title<input required value={form.title} onChange={e => { update('title', e.target.value); if (!project) update('slug', slugify(e.target.value)); }} className="mt-1 w-full border border-stone-300 bg-white p-3" /></label><label>Slug<input required value={form.slug} onChange={e => update('slug', e.target.value)} className="mt-1 w-full border border-stone-300 bg-white p-3" /><span className="mt-1 block text-xs text-stone-500">Public URL: /projects/{slugify(form.slug) || 'your-project'}</span></label><label>Date<input type="date" value={form.project_date || ''} onChange={e => update('project_date', e.target.value || null)} className="mt-1 w-full border border-stone-300 bg-white p-3" /></label><label>Description<textarea rows={5} value={form.description || ''} onChange={e => update('description', e.target.value)} className="mt-1 w-full border border-stone-300 bg-white p-3" /></label><label className="flex items-center gap-3"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} /> Published</label><button onClick={save} disabled={saving || !form.title || !form.slug} className="w-fit bg-stone-900 px-5 py-3 text-white disabled:opacity-50">{saving ? 'Saving…' : project ? 'Save project' : 'Create project'}</button></div></section>{project && <section className="mt-12 border-t border-stone-300 pt-6"><h2 className="display text-3xl">Artwork</h2><p className="mt-2 text-sm text-stone-600">Upload multiple files, then drag items to set their public viewing order.</p><label className="mt-6 block border-2 border-dashed border-stone-300 p-8 text-center"><span className="text-sm">Choose or drop JPEG, PNG, WebP, or AVIF images (20 MB max)</span><input aria-label="Upload artwork" multiple accept={allowedImageTypes.join(',')} type="file" onChange={e => upload(e.target.files)} className="sr-only" /></label>{images.length === 0 ? <p className="py-10 text-stone-500">No artwork uploaded yet.</p> : <div className="mt-7 grid gap-5">{images.map((image, index) => <article key={image.id} draggable onDragStart={() => setDragged(image.id)} onDragOver={e => e.preventDefault()} onDrop={() => reorder(image.id)} className="grid gap-4 border border-stone-300 p-4 sm:grid-cols-[180px_1fr]"><div className="relative aspect-square bg-stone-100"><Image src={imageUrl(image.storage_path)} alt="" fill sizes="180px" className="object-contain" /></div><div><div className="flex justify-between gap-3"><span className="text-sm text-stone-500">{index + 1}. Drag to reorder</span><label className="flex items-center gap-2 text-sm"><input checked={form.cover_image_id === image.id} onChange={() => update('cover_image_id', form.cover_image_id === image.id ? null : image.id)} type="radio" name="cover" /> Cover</label></div><label className="mt-3 block text-sm">Alt text<input value={image.alt_text} onChange={e => setImages(items => items.map(i => i.id === image.id ? { ...i, alt_text: e.target.value } : i))} className="mt-1 w-full border border-stone-300 p-2" /></label><label className="mt-3 block text-sm">Caption<textarea value={image.caption || ''} onChange={e => setImages(items => items.map(i => i.id === image.id ? { ...i, caption: e.target.value } : i))} className="mt-1 w-full border border-stone-300 p-2" /></label><div className="mt-3 flex gap-4"><button onClick={() => saveImage(image)} className="text-sm underline">Save artwork text</button><button onClick={() => deleteImage(image)} className="text-sm text-red-700 underline">Delete</button></div></div></article>)}</div>}</section>}</>; }
