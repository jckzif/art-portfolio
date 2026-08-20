import { createBrowserClient } from '@supabase/ssr';

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const message = 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.';
    const result = { data: null, error: new Error(message) };

    return {
      auth: {
        signInWithPassword: async () => ({ error: new Error(message) }),
      },
      from: async () => result,
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error(message) }),
          remove: async () => ({ data: null, error: new Error(message) }),
        }),
      },
    } as any;
  }

  return createBrowserClient(url, key);
}
