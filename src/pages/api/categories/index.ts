import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerClient(cookies);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
    }

    if (name.length > 100) {
      return new Response(JSON.stringify({ error: 'Nombre demasiado largo (máx. 100 caracteres)' }), { status: 400 });
    }
    
    if (slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: 'Slug inválido' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, slug, description: description || null }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true, data }), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[Categories API Error]:', err);
    return new Response(
      JSON.stringify({ error: import.meta.env.PROD ? 'Error interno del servidor' : message }),
      { status: 500 }
    );
  }
};