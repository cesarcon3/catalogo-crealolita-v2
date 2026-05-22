import React, { useState } from 'react';
import type { Category } from '@/core/types/database';
import { ConfirmModal } from '@/ui/components/ConfirmModal';

interface CategoryListProps {
  initialCategories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ initialCategories }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteClick = (cat: Category) => {
    setCategoryToDelete(cat);
    setError('');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      const result = await res.json();

      if (res.ok) {
        // Actualizamos la lista instantáneamente sin recargar la página
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));
        setIsModalOpen(false);
      } else {
        // Mostramos el error elegante dentro de la interfaz, NO en un alert()
        setError(result.error || 'No se pudo eliminar la categoría.');
        setIsModalOpen(false);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 font-medium text-sm border-b border-red-100">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream-100 text-brand-muted text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Slug (URL)</th>
              <th className="p-4 font-medium">Descripción</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {categories.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-brand-muted italic">No hay categorías registradas.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-cream-50 transition-colors">
                  <td className="p-4 font-semibold text-brand-text">{cat.name}</td>
                  <td className="p-4 text-sm text-brand-muted font-mono">{cat.slug}</td>
                  <td className="p-4 text-sm text-brand-muted truncate max-w-xs">{cat.description || '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <a href={`/admin/categorias/editar/${cat.id}`} className="text-gold hover:text-gold-dark font-medium text-sm">Editar</a>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteClick(cat)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={isModalOpen}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Si tiene productos vinculados, la acción será bloqueada por seguridad.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
        isLoading={loading}
      />
    </div>
  );
};