import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';
import type { SaleType } from '@/core/types/database';
import { validateImageFile, parseStringArray, VALID_SALE_TYPES } from '@/lib/api-validators';

interface StoragePathItem {
  storage_path: string;
}

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const id = params.id;
    const supabase = createSupabaseServerClient(cookies);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    const formData = await request.formData();
    
    const name = formData.get('name')?.toString();
    const slug = formData.get('slug')?.toString();
    const description = formData.get('description')?.toString() || null;
    const category_id = formData.get('category_id')?.toString() || null;
    const production_time = formData.get('production_time')?.toString() || null;
    
    const is_active = formData.get('is_active') === 'true';
    const is_featured = formData.get('is_featured') === 'true';

    if (!name || !slug || !id) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
    }

    const priceStr = formData.get('price')?.toString();
    if (!priceStr) {
      return new Response(JSON.stringify({ error: 'El precio es obligatorio' }), { status: 400 });
    }
    const parsedPrice = parseFloat(priceStr);
    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 999999.99) {
      return new Response(JSON.stringify({ error: 'Precio inválido o fuera de rango' }), { status: 400 });
    }

    const sale_type = formData.get('sale_type')?.toString() as SaleType;
    if (!VALID_SALE_TYPES.includes(sale_type)) {
      return new Response(JSON.stringify({ error: 'Modalidad de venta inválida' }), { status: 400 });
    }

    const features = parseStringArray(formData.get('features')?.toString());
    const customization_options = parseStringArray(formData.get('customization_options')?.toString());
    
    const deletedImages = parseStringArray(formData.get('deleted_images')?.toString());
    const newImages = formData.getAll('images') as File[];

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        slug,
        description,
        price: parsedPrice,
        category_id,
        sale_type,
        production_time,
        customization_options,
        features,
        is_active,
        is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    if (deletedImages.length > 0) {
      const { data: validImages } = await supabase
        .from('product_images')
        .select('storage_path')
        .eq('product_id', id);
        
      const validPaths = new Set(validImages?.map((i: StoragePathItem) => i.storage_path) || []);
      const safeDeletedImages = deletedImages.filter((path: string) => validPaths.has(path));

      if (safeDeletedImages.length > 0) {
        await supabase.storage.from('product-images').remove(safeDeletedImages);
        await supabase.from('product_images').delete().in('storage_path', safeDeletedImages);
      }
    }

    if (newImages.length > 0) {
      const imageRecords = [];
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        if (!file || file.size === 0) continue;
        
        const validationError = validateImageFile(file);
        if (validationError) {
           return new Response(JSON.stringify({ error: validationError }), { status: 400 });
        }
        
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (!uploadError) {
          imageRecords.push({
            product_id: id,
            storage_path: fileName,
            is_primary: false,
            display_order: 99 + i
          });
        }
      }

      if (imageRecords.length > 0) {
        await supabase.from('product_images').insert(imageRecords);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[API Error]:', err);
    return new Response(
      JSON.stringify({ error: import.meta.env.PROD ? 'Error interno del servidor' : message }), 
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const id = params.id;
    const supabase = createSupabaseServerClient(cookies);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

    const { data: images } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', id);

    if (images && images.length > 0) {
      const paths = images.map((img: StoragePathItem) => img.storage_path);
      await supabase.storage.from('product-images').remove(paths);
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[API Error]:', err);
    return new Response(
      JSON.stringify({ error: import.meta.env.PROD ? 'Error interno del servidor' : message }), 
      { status: 500 }
    );
  }
};