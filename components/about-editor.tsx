'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { allowedImageTypes, maxImageBytes } from '@/lib/utils';

type AboutContent = { id: number; left_text: string; right_text: string; image_path: string | null };

export function AboutEditor() {
  const db = createClient();
  const [form, setForm] = useState({ left_text: '', right_text: '' });
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.from('about_content').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) {
        const d = data as AboutContent;
        setForm({ left_text: d.left_text, right_text: d.right_text });
        setImagePath(d.image_path);
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    setMessage('');
    const { error } = await db.from('about_content').upsert({ id: 1, ...form, image_path: imagePath });
    setSaving(false);
    setMessage(error ? `Could not save: ${error.message}` : 'Saved.');
  }

  async function uploadImage(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (!allowedImageTypes.includes(file.type) || file.size > maxImageBytes) {
      setMessage('Use JPEG, PNG, WebP, or AVIF up to 20 MB.');
      return;
    }
    setMessage('Uploading…');
    if (imagePath) await db.storage.from('artwork').remove([imagePath]);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `about/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from('artwork').upload(path, file, { contentType: file.type });
    if (error) { setMessage(`Upload failed: ${error.message}`); return; }
    setImagePath(path);
    setMessage('Image uploaded. Click Save to apply.');
  }

  const imgUrl = imagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${imagePath}`
    : null;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-4xl">About page</h1>
          <p className="mt-2 text-stone-600">Edit the two text columns and the image shown on the About page.</p>
        </div>
      </div>

      <p className="mt-2 text-sm text-stone-500">
        Tip: add links with <code className="bg-stone-100 px-1">[link text](https://url.com)</code>
      </p>

      <div aria-live="polite" className="mt-4 text-sm text-stone-600">{message}</div>

      {loading ? <p className="py-12">Loading…</p> : (
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-1">
              Left column
              <textarea
                rows={10}
                value={form.left_text}
                onChange={e => setForm(f => ({ ...f, left_text: e.target.value }))}
                className="w-full border border-stone-300 bg-white p-3"
                placeholder="Artist statement, bio…"
              />
            </label>
            <label className="flex flex-col gap-1">
              Right column
              <textarea
                rows={10}
                value={form.right_text}
                onChange={e => setForm(f => ({ ...f, right_text: e.target.value }))}
                className="w-full border border-stone-300 bg-white p-3"
                placeholder="Contact, links, press…"
              />
            </label>
            <button
              onClick={save}
              disabled={saving}
              className="w-fit bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-medium">Photo</p>
            {imgUrl && (
              <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden bg-stone-100">
                <Image src={imgUrl} alt="About" fill className="object-cover" sizes="320px" />
              </div>
            )}
            <label className="w-fit cursor-pointer border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">
              {imgUrl ? 'Replace photo' : 'Upload photo'}
              <input
                type="file"
                accept={allowedImageTypes.join(',')}
                className="sr-only"
                onChange={e => uploadImage(e.target.files)}
              />
            </label>
          </div>
        </div>
      )}
    </>
  );
}
