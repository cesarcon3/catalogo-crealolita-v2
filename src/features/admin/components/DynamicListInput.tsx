import React, { useState } from 'react';
import { Button } from '@/ui/components/Button';

interface DynamicListInputProps {
  label: string;
  items: { id: string; value: string }[];
  onAdd: (item: string) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
}

export const DynamicListInput: React.FC<DynamicListInputProps> = ({ 
  label, 
  items, 
  onAdd, 
  onRemove,
  placeholder = ''
}) => {
  const [currentValue, setCurrentValue] = useState('');
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleAdd = () => {
    if (currentValue.trim()) {
      onAdd(currentValue.trim());
      setCurrentValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // FIX: Si el usuario escribe pero olvida hacer clic en "+", autoguardamos al perder el foco
  const handleBlur = () => {
    if (currentValue.trim()) {
      handleAdd();
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-brand-text mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-brand-border rounded-lg outline-none bg-cream-100 focus:ring-2 focus:ring-gold"
        />
        <Button type="button" onClick={handleAdd} variant="primary" className="!px-4">
          +
        </Button>
      </div>
      
      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between items-center bg-cream-100 px-3 py-1.5 rounded-lg text-sm text-brand-text border border-brand-border">
              <span>{item.value}</span>
              <button 
                type="button" 
                onClick={() => onRemove(item.id)} 
                className="text-red-500 font-bold hover:text-red-700 px-2"
                title="Eliminar elemento"
                aria-label={`Eliminar ${item.value}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};