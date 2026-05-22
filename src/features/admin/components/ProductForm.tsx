import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import type { Category, SaleType } from '@/core/types/database';
import { Button } from '@/ui/components/Button';
import { DynamicListInput } from './DynamicListInput';
import { ImageUploader } from './ImageUploader';
import { navigate } from 'astro:transitions/client';
import { generateSlug } from '@/core/utils/slug';
import { ConfirmModal } from '@/ui/components/ConfirmModal';

// Generador de IDs universal para evitar bloqueos
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export interface ExistingImage {
  id: string;
  url: string;
  path: string;
  is_primary: boolean;
}

export interface InitialProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  saleType: SaleType;
  productionTime: string;
  isActive: boolean;
  isFeatured: boolean;
  features: string[];
  customizations: string[];
  existingImages: ExistingImage[];
}

interface ProductFormProps {
  categories: Category[];
  initialData?: InitialProductData;
}

interface PreviewItem {
  id: string;
  url: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ categories, initialData }) => {
  const isEdit = !!initialData;

  const [name, setName] = useState<string>(initialData?.name || '');
  const [slug, setSlug] = useState<string>(initialData?.slug || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [price, setPrice] = useState<string>(initialData?.price || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || '');
  const [saleType, setSaleType] = useState<SaleType>(initialData?.saleType || 'docena');
  const [productionTime, setProductionTime] = useState<string>(initialData?.productionTime || '');
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? false);

  const [features, setFeatures] = useState<{id: string, value: string}[]>(
    (initialData?.features || []).map(f => ({ id: generateId(), value: f }))
  );
  const [customizations, setCustomizations] = useState<{id: string, value: string}[]>(
    (initialData?.customizations || []).map(c => ({ id: generateId(), value: c }))
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialData?.existingImages || []);
  const [deletedExistingImagePaths, setDeletedExistingImagePaths] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSlugManual, setIsSlugManual] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach(p => {
        try { URL.revokeObjectURL(p.url); } catch { /* silenciar */ }
      });
    };
  }, [previews]);

  useEffect(() => {
    setName(initialData?.name || '');
    setSlug(initialData?.slug || '');
    setDescription(initialData?.description || '');
    setPrice(initialData?.price || '');
    setCategoryId(initialData?.categoryId || '');
    setSaleType(initialData?.saleType || 'docena');
    setProductionTime(initialData?.productionTime || '');
    setIsActive(initialData?.isActive ?? true);
    setIsFeatured(initialData?.isFeatured ?? false);
    setFeatures((initialData?.features || []).map(f => ({ id: generateId(), value: f })));
    setCustomizations((initialData?.customizations || []).map(c => ({ id: generateId(), value: c })));
    setExistingImages(initialData?.existingImages || []);
    setDeletedExistingImagePaths([]);
    setSelectedFiles([]);
    setPreviews([]);
    setError('');
    setIsSlugManual(false);
    setIsDeleteModalOpen(false);
  }, [initialData?.id]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (!isEdit && !isSlugManual) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlug(value);
    if (value === '') {
      setIsSlugManual(false);
    } else {
      setIsSlugManual(true);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => ({
        id: generateId(),
        url: URL.createObjectURL(file)
      }));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = [...prev];
      if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const removeExistingImage = (path: string) => {
    setExistingImages(prev => prev.filter(img => img.path !== path));
    setDeletedExistingImagePaths(prev => [...prev, path]);
  };

  const confirmDeleteProduct = async () => {
    if (!initialData) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${initialData.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      navigate('/admin/productos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el producto');
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('price', price);
    if (categoryId) formData.append('category_id', categoryId);
    formData.append('sale_type', saleType);
    formData.append('production_time', productionTime);
    formData.append('is_active', String(isActive));
    formData.append('is_featured', String(isFeatured));
    
    formData.append('features', JSON.stringify(features.map(f => f.value)));
    formData.append('customization_options', JSON.stringify(customizations.map(c => c.value)));

    if (isEdit && deletedExistingImagePaths.length > 0) {
      formData.append('deleted_images', JSON.stringify(deletedExistingImagePaths));
    }

    selectedFiles.forEach(file => formData.append('images', file));

    try {
      const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Error al guardar');
      
      previews.forEach(p => {
        try { URL.revokeObjectURL(p.url); } catch { /* silenciar */ }
      });
      navigate('/admin/productos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-brand-border shadow-sm">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">
          {error}
        </div>
      )}

      <ImageUploader 
        existingImages={existingImages}
        onRemoveExisting={removeExistingImage}
        previews={previews}
        onFileChange={handleFileChange}
        onRemoveNewFile={removeNewFile}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="product-name" className="block text-sm font-semibold text-brand-text mb-2">Nombre del Producto *</label>
          <input
            id="product-name"
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label htmlFor="product-slug" className="block text-sm font-semibold text-brand-text mb-2">URL Slug *</label>
          <input
            id="product-slug"
            type="text"
            required
            value={slug}
            onChange={handleSlugChange}
            disabled={isEdit}
            className={`w-full px-4 py-2 border border-brand-border rounded-lg outline-none font-mono text-sm ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-cream-200 text-brand-muted'}`}
            title={isEdit ? "No se puede editar el slug" : ""}
          />
        </div>
      </div>

      <div>
        <label htmlFor="product-description" className="block text-sm font-semibold text-brand-text mb-2">Descripción</label>
        <textarea
          id="product-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="product-price" className="block text-sm font-semibold text-brand-text mb-2">Precio base (USD) *</label>
          <input
            id="product-price"
            type="number"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label htmlFor="product-category" className="block text-sm font-semibold text-brand-text mb-2">Categoría</label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold"
          >
            <option value="">Selecciona...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="product-saletype" className="block text-sm font-semibold text-brand-text mb-2">Modalidad de Venta</label>
          <select
            id="product-saletype"
            value={saleType}
            onChange={(e) => setSaleType(e.target.value as SaleType)}
            className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold"
          >
            <option value="docena">Solo por Docena</option>
            <option value="unidad">Solo por Unidad</option>
            <option value="mixto">Mixto (Docena y Unidad)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DynamicListInput 
          label="Características"
          placeholder="Ej. MDF de alta calidad 3mm"
          items={features}
          onAdd={(val) => setFeatures(prev => [...prev, { id: generateId(), value: val }])}
          onRemove={(id) => setFeatures(prev => prev.filter((f) => f.id !== id))}
        />

        <DynamicListInput 
          label="Personalización"
          placeholder="Ej. Nombre de la Quinceañera"
          items={customizations}
          onAdd={(val) => setCustomizations(prev => [...prev, { id: generateId(), value: val }])}
          onRemove={(id) => setCustomizations(prev => prev.filter((c) => c.id !== id))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-4 border-t border-brand-border">
        <div>
          <label htmlFor="product-production" className="block text-sm font-semibold text-brand-text mb-2">Tiempo estimado de producción</label>
          <input
            id="product-production"
            type="text"
            value={productionTime}
            onChange={(e) => setProductionTime(e.target.value)}
            className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-5 h-5 accent-gold cursor-pointer" />
          <label htmlFor="isActive" className="text-sm font-semibold text-brand-text cursor-pointer">Visible públicamente</label>
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-gold cursor-pointer" />
          <label htmlFor="isFeatured" className="text-sm font-semibold text-brand-text cursor-pointer">Destacar en Inicio (★)</label>
        </div>
      </div>

      <div className="pt-4 flex justify-between gap-4 border-t border-brand-border mt-6">
        <div>
          {isEdit && (
            <Button type="button" variant="danger" onClick={() => setIsDeleteModalOpen(true)} disabled={loading}>
              Borrar Producto
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <Button href="/admin/productos" variant="neutral">Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar Producto' : 'Crear Producto')}
          </Button>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer y borrará permanentemente sus imágenes asociadas."
        onConfirm={confirmDeleteProduct}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={loading}
      />
    </form>
  );
};