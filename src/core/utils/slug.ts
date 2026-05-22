export const generateSlug = (text: string | undefined | null): string => {
  if (!text) return '';
  return String(text)
    .replace(/\u00f1/g, 'n')              // Convierte ñ en n (antes del normalize)
    .replace(/\u00d1/g, 'N')              // Convierte Ñ en N (antes del normalize)
    .normalize('NFD')                      // Separa las letras de sus acentos
    .replace(/[\u0300-\u036f]/g, '')       // Elimina los acentos separados
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')             // Elimina caracteres especiales restantes
    .replace(/[\s_-]+/g, '-')             // Reemplaza espacios por guiones
    .replace(/^-+|-+$/g, '');             // Limpia guiones al inicio o final
};