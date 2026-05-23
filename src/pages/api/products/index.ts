import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';
import type { SaleType } from '@/core/types/database';
import { validateImageFile, parseStringArray, VALID_SALE_TYPES } from '@/lib/api-validators';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerClient(cookies);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const formData = await request.formData();
    
    const name = formData.get('name')?.toString();
    const slug = formData.get('slug')?.toString();
    const description = formData.get('description')?.toString() || null;
    const category_id = formData.get('category_id')?.toString() || null;
    const production_time = formData.get('production_time')?.toString() || null;
    
    const is_active = formData.get('is_active') === 'true';
    const is_featured = formData.get('is_featured') === 'true';

    if (!name || !slug) {
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

    const images = formData.getAll('images') as File[];
    const validImagesToUpload: File[] = [];

    for (const file of images) {
      if (file && file.size > 0) {
        const validationError = validateImageFile(file);
        if (validationError) {
          return new Response(JSON.stringify({ error: `Error en imagen "${file.name}": ${validationError}` }), { status: 400 });
        }
        validImagesToUpload.push(file);
      }
    }

    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
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
        is_featured
      }])
      .select()
      .single();

    if (productError || !productData) {
      return new Response(JSON.stringify({ error: productError?.message || 'Error al crear producto en la base de datos' }), { status: 500 });
    }

    if (validImagesToUpload.length > 0) {
      const imageRecords = [];
      
      for (let i = 0; i < validImagesToUpload.length; i++) {
        const file = validImagesToUpload[i];
        
        // FIX: Guardia para validación estricta de TypeScript
        if (!file) continue;

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${productData.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) {
          await supabase.from('products').delete().eq('id', productData.id);
          return new Response(JSON.stringify({ error: `Fallo de red al subir imagen. Se canceló la creación del producto por seguridad.` }), { status: 500 });
        }

        imageRecords.push({
          product_id: productData.id,
          storage_path: fileName,
          is_primary: i === 0,
          display_order: i
        });
      }

      if (imageRecords.length > 0) {
        await supabase.from('product_images').insert(imageRecords);
      }
    }

    return new Response(JSON.stringify({ success: true, data: productData }), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[API Error]:', err);
    return new Response(
      JSON.stringify({ error: import.meta.env.PROD ? 'Error interno del servidor' : message }), 
      { status: 500 }
    );
  }
};