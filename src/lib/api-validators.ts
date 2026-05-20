import type { SaleType } from '@/core/types/database';

export const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const VALID_SALE_TYPES: SaleType[] = ['unidad', 'docena', 'mixto'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) return `Tipo no permitido: ${file.type}`;
  if (file.size > MAX_IMAGE_SIZE_BYTES) return `El archivo supera el límite de 5MB`;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.has(ext)) return `Extensión no permitida: .${ext}`;
  return null;
}

export function parseStringArray(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}