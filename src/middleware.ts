import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const onRequest = defineMiddleware(async ({ cookies, url, request, redirect, locals }, next) => {
  const isApiMutation = url.pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
  const isLoginPage = url.pathname === '/admin/login';

  // 1. Protección de Rutas (Autenticación)
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

  const response = await next();
  
  // 2. Cabeceras de Seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
  
  const supabaseHost = new URL(import.meta.env.PUBLIC_SUPABASE_URL).hostname;
  
  // 🔥 FIX CRÍTICO: Restauramos 'unsafe-inline' en script-src. 
  // Sin esto, el framework Astro no puede cargar React y todos los formularios quedan inútiles.
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://${supabaseHost}; connect-src 'self' https://${supabaseHost};`
  );
  
  if (import.meta.env.PROD) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }

  // 3. Estrategia de Caché
  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  } else if (url.pathname.startsWith('/admin')) {
    // Las páginas admin NUNCA deben cachearse
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
});