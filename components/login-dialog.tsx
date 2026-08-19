'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => { const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);
  if (!open) return null;
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(''); const { error } = await createClient().auth.signInWithPassword({ email, password }); setBusy(false); if (error) return setError(error.message); router.replace(params.get('next') || '/admin'); }
  return <div role="dialog" aria-modal="true" aria-labelledby="login-title" className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={onClose}><form onMouseDown={event => event.stopPropagation()} onSubmit={submit} className="w-full max-w-sm bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><h2 id="login-title" className="text-3xl">Sign in</h2><button type="button" onClick={onClose} aria-label="Close sign in" className="text-2xl leading-none">×</button></div><p className="mt-1 text-sm">Use your administrator account.</p><label className="mt-6 block text-lg">Email<input required autoFocus type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full border p-3" /></label><label className="mt-4 block text-lg">Password<input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full border p-3" /></label>{error && <p role="alert" className="mt-4 text-sm">{error}</p>}<button disabled={busy} className="mt-6 w-full bg-black px-4 py-3 text-lg text-white disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button></form></div>;
}
