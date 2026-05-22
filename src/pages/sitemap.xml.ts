import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { SITE_CONFIG } from '@/core/constants/site';

interface SitemapCategory {
  slug: string;
}

interface SitemapProduct {
  slug: string;
  updated_at: string | null;
}

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const GET: APIRoute = async () => {
  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('categories').select('slug')
  ]);

  const products = productsRes.data || [];
  const categories = categoriesRes.data || [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${SITE_CONFIG.url}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${categories.map((cat: SitemapCategory) => `
        <url>
          <loc>${SITE_CONFIG.url}/categoria/${escapeXml(cat.slug)}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
      ${products.map((prod: SitemapProduct) => `
        <url>
          <loc>${SITE_CONFIG.url}/producto/${escapeXml(prod.slug)}</loc>
          <lastmod>${prod.updated_at ? new Date(prod.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
    </urlset>
  `.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};