import React, { useEffect, useRef } from 'react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, isLoading = false 
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => cancelRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = 'unset';
      previousFocusRef.current?.focus();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isLoading) onCancel();
      
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        
        const first = focusable.item(0) as HTMLElement | null;
        const last = focusable.item(focusable.length - 1) as HTMLElement | null;

        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl flex-shrink-0">
            ⚠️
          </div>
          <h2 id="modal-title" className="text-xl font-bold text-brand-text">{title}</h2>
        </div>
        
        <p className="text-brand-muted mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button ref={cancelRef} type="button" variant="neutral" onClick={onCancel} disabled={isLoading} fullWidth>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={isLoading} fullWidth>
            {isLoading ? 'Procesando...' : 'Sí, eliminar'}
          </Button>
        </div>
      </div>
    </div>
  );
};