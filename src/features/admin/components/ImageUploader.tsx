import React, { type ChangeEvent } from 'react';
import type { ExistingImage } from './ProductForm';

interface PreviewItem {
  id: string;
  url: string;
}

interface ImageUploaderProps {
  existingImages: ExistingImage[];
  onRemoveExisting: (path: string) => void;
  previews: PreviewItem[];
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveNewFile: (index: number) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  existingImages,
  onRemoveExisting,
  previews,
  onFileChange,
  onRemoveNewFile
}) => {
  return (
    <div className="p-6 bg-cream-100 rounded-xl border-2 border-dashed border-gold-light">
      <label className="block text-lg font-bold text-gold-dark mb-4">Fotografías del Producto</label>
      
      {existingImages.length > 0 && (
        <div className="mb-6">
          <span className="text-sm font-semibold text-brand-muted block mb-2">Imágenes actuales:</span>
          <div className="flex gap-4 overflow-x-auto py-2">
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-32 h-32 flex-shrink-0 group">
                <img src={img.url} alt="Existente" className="w-full h-full object-cover rounded-lg border border-brand-border shadow-sm" />
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.path)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Eliminar imagen actual"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onFileChange}
        className="w-full text-sm text-brand-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-white hover:file:bg-gold-dark transition-colors cursor-pointer"
      />
      
      {previews.length > 0 && (
        <div className="mt-6 border-t border-brand-border pt-4">
          <span className="text-sm font-semibold text-brand-muted block mb-2">Imágenes nuevas a subir:</span>
          <div className="flex gap-4 overflow-x-auto py-2">
            {previews.map((preview, idx) => (
              <div key={preview.id} className="relative w-32 h-32 flex-shrink-0 group">
                <img src={preview.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-lg border-2 border-green-400 shadow-sm" />
                <button
                  type="button"
                  onClick={() => onRemoveNewFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};