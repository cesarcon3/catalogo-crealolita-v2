import { supabase } from '../../../lib/supabase';
import type { Product, Category } from '@/core/types/database';

export interface PublicProduct extends Omit<Product, 'categories'> {
  primary_image_url: string | null;
  categories: { name: string; slug: string } | null;
}

export interface ProductDetail extends Omit<Product, 'categories'> {
  images: { url: string | null; is_primary: boolean }[];
  categories: { name: string; slug: string } | null;
}

interface RawProduct extends Omit<Product, 'categories'> {
  categories: { name: string; slug: string } | null;
  product_images: { storage_path: string; is_primary: boolean; display_order?: number }[];
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data as Category[];
};

export const getPublicProducts = async (page = 1, perPage = 48): Promise<{ featured: PublicProduct[], regular: PublicProduct[] }> => {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      product_images (storage_path, is_primary)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) {
    console.error('Error fetching public products:', error);
    return { featured: [], regular: [] };
  }

  const formattedProducts: PublicProduct[] = (data as unknown as RawProduct[]).map((item) => {
    const primaryImage = item.product_images?.find((img) => img.is_primary) 
                      || item.product_images?.[0];

    return {
      ...item,
      categories: item.categories,
      primary_image_url: getImageUrl(primaryImage?.storage_path)
    };
  });

  return {
    featured: formattedProducts.filter(p => p.is_featured),
    regular: formattedProducts.filter(p => !p.is_featured)
  };
};

export const getProductsByCategory = async (categorySlug: string, page = 1, perPage = 48): Promise<PublicProduct[]> => {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories!inner (name, slug),
      product_images (storage_path, is_primary)
    `)
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) {
    console.error('Error fetching category products:', error);
    return [];
  }

  return (data as unknown as RawProduct[]).map((item) => {
    const primaryImage = item.product_images?.find((img) => img.is_primary) 
                      || item.product_images?.[0];

    return {
      ...item,
      categories: item.categories,
      primary_image_url: getImageUrl(primaryImage?.storage_path)
    };
  });
};

export const getProductBySlug = async (slug: string): Promise<ProductDetail | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      product_images (storage_path, is_primary, display_order)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('Error fetching product details:', error);
    return null;
  }

  const rawData = data as unknown as RawProduct;

  const sortedImages = (rawData.product_images || [])
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((img) => ({
      url: getImageUrl(img.storage_path),
      is_primary: img.is_primary
    }));

  return {
    ...rawData,
    categories: rawData.categories,
    images: sortedImages
  };
};