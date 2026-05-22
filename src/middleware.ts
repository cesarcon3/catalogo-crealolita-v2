import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@/lib/supabase-server';

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export const onRequest = defineMiddleware(async ({ cookies, url, request, redirect, locals }, next) => {
  const isApiMutation = url.pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
  const isLoginPage = url.pathname === '/admin/login';

  if (url.pathname.startsWith('/admin') || isApiMutation) {
    const supabase = createSupabaseServerClient(cookies);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      if (isApiMutation) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
      }
      if (!isLoginPage) {
        return redirect('/admin/login');
      }
    }

    if (user && isLoginPage) {
      return redirect('/admin');
    }

    if (user && typeof user.email === 'string') {
      locals.userEmail = user.email;
    }
  }

  const nonce = generateNonce();
  locals.cspNonce = nonce;

  const response = await next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
  
  const supabaseHost = new URL(import.meta.env.PUBLIC_SUPABASE_URL).hostname;
  
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://${supabaseHost}; connect-src 'self' https://${supabaseHost};`
  );
  
  if (import.meta.env.PROD) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }

  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
} else if (url.pathname.startsWith('/admin')) {
  // Las páginas admin NUNCA deben cachearse
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache'); // compatibilidad HTTP/1.0
}

  return response;
});