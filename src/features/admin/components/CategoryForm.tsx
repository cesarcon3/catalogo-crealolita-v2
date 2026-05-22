import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import type { Category } from '@/core/types/database';
import { Button } from '@/ui/components/Button';
import { navigate } from 'astro:transitions/client';
import { generateSlug } from '@/core/utils/slug';
import { ConfirmModal } from '@/ui/components/ConfirmModal';

interface CategoryFormProps {
  initialData?: Category;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData }) => {
  const isEdit = !!initialData;
  const [name, setName] = useState<string>(initialData?.name || '');
  const [slug, setSlug] = useState<string>(initialData?.slug || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSlugManual, setIsSlugManual] = useState(false);

  useEffect(() => {
    setName(initialData?.name || '');
    setSlug(initialData?.slug || '');
    setDescription(initialData?.description || '');
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

  const confirmDelete = async () => {
    if (!initialData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/categories/${initialData.id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ocurrió un error al intentar eliminar la categoría.');
      }
      
      navigate('/admin/categorias');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor.');
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/categories/${initialData.id}` : '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = { name, slug, description };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al guardar los datos.');
      
      navigate('/admin/categorias');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-brand-border shadow-sm relative">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category-name" className="block text-sm font-semibold text-brand-text mb-2">Nombre *</label>
          <input 
            id="category-name"
            type="text" 
            required 
            value={name} 
            onChange={handleNameChange} 
            className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold" 
            placeholder="Ej. Bodas" 
          />
        </div>
        <div>
          <label htmlFor="category-slug" className="block text-sm font-semibold text-brand-text mb-2">URL Slug *</label>
          <input 
            id="category-slug"
            type="text" 
            required 
            value={slug} 
            onChange={handleSlugChange} 
            disabled={isEdit} 
            className={`w-full px-4 py-2 border border-brand-border rounded-lg outline-none font-mono text-sm ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-cream-200 text-brand-muted'}`} 
          />
        </div>
      </div>

      <div>
        <label htmlFor="category-desc" className="block text-sm font-semibold text-brand-text mb-2">Descripción</label>
        <textarea 
          id="category-desc"
          rows={3} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold" 
          placeholder="Descripción breve de la categoría..." 
        />
      </div>

      <div className="pt-4 flex justify-between gap-4 border-t border-brand-border mt-6">
        <div>
          {isEdit && (
            <Button type="button" variant="danger" onClick={() => setIsDeleteModalOpen(true)} disabled={loading}>
              Borrar Categoría
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <Button href="/admin/categorias" variant="neutral">Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Si la categoría tiene productos vinculados, la acción será bloqueada por seguridad."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={loading}
      />
    </form>
  );
};