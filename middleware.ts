import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ASCII_ART = String.raw`
            .-''''-.
          .'  .-.  '.
         /   /   \   \
         |   | .-.|   |
         |   | | ||   |
         |   | | ||   |
          \   \_//'  /
           '._   _.'
               '---'
             _/   \_
           .'  _ _  '.
          /   (   )   \
          |   .-.-.   |
          |  /     \  |
          '._\_._.'/_.
               \`-._.-'

          jackzif.art
`;

export async function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';

  if (request.nextUrl.pathname === '/' && (ua.toLowerCase().includes('curl') || accept.toLowerCase().includes('text/plain'))) {
    return new NextResponse(ASCII_ART.trim(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((!user || user.app_metadata?.role !== 'admin') && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', '1');
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = { matcher: ['/', '/admin/:path*'] };
