import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.');
  }

  const jar = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items: Array<{ name: string; value: string; options: Record<string, unknown> }>) => {
        try {
          items.forEach(({ name, value, options }) => {
            jar.set(name, value, options);
          });
        } catch {}
      },
    },
  });
}
