export const generateSlug = (text: string | undefined | null): string => {
  if (!text) return '';
  return String(text)
    .normalize('NFD')                         // Separa las letras de sus acentos
    .replace(/[\u0300-\u036f]/g, '')          // Elimina los acentos separados
    .replace(/ñ/gi, 'n')                      // Convierte la 'ñ' en 'n'
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')                 // Elimina caracteres especiales restantes
    .replace(/[\s_-]+/g, '-')                 // Reemplaza espacios por guiones
    .replace(/^-+|-+$/g, '');                 // Limpia guiones al inicio o final
};