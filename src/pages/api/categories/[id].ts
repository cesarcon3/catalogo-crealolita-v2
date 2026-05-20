import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

    const supabase = createSupabaseServerClient(cookies);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    const body = await request.json();
    const { name, slug, description } = body;

    if (name && name.length > 100) {
      return new Response(JSON.stringify({ error: 'Nombre demasiado largo (máx. 100 caracteres)' }), { status: 400 });
    }
    
    if (slug && (slug.length > 100 || !/^[a-z0-9-]+$/.test(slug))) {
      return new Response(JSON.stringify({ error: 'Slug inválido' }), { status: 400 });
    }

    const { error } = await supabase
      .from('categories')
      .update({ name, slug, description: description || null })
      .eq('id', id);

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[Categories API Error]:', err);
    return new Response(
      JSON.stringify({ error: import.meta.env.PROD ? 'Error interno del servidor' : message }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

    const supabase = createSupabaseServerClient(cookies);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      if (error.code === '23503') {
        return new Response(
          JSON.stringify({ 
            error: 'No se puede eliminar la categoría porque tiene productos vinculados. Reasigna o elimina esos productos primero.' 
          }), 
          { status: 400 }
        );
      }
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[Categories API Error]:', err);
    return new Response(
      JSON.stringify({ error: import.meta.env.PROD ? 'Error interno del servidor' : message }),
      { status: 500 }
    );
  }
};