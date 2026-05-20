import React, { useState, useMemo } from 'react';
import { SITE_CONFIG } from '@/core/constants/site';
import type { SaleType } from '@/core/types/database';

interface OrderCalculatorProps {
  productName: string;
  productSlug: string;
  price: number;
  currency: string;
  saleType: SaleType;
}

export const OrderCalculator: React.FC<OrderCalculatorProps> = ({
  productName,
  productSlug,
  price,
  currency,
  saleType
}) => {
  const [selectedType, setSelectedType] = useState<'unidad' | 'docena'>(
    saleType === 'unidad' ? 'unidad' : 'docena'
  );
  const [quantity, setQuantity] = useState<number>(1);

  const currentPrice = useMemo(() => {
    if (saleType === 'mixto') {
      return selectedType === 'docena' ? price : price / 12;
    }
    return price;
  }, [price, saleType, selectedType]);

  const subtotal = currentPrice * quantity;

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const generateWhatsAppLink = () => {
    const productUrl = `${SITE_CONFIG.url}/producto/${productSlug}`;
    const typeLabel = selectedType === 'docena' 
      ? (quantity > 1 ? 'docenas' : 'docena') 
      : (quantity > 1 ? 'unidades' : 'unidad');
      
    const message = `Hola, vengo del catálogo web. Me interesa hacer un pedido:\n\n*Producto:* ${productName}\n*Cantidad:* ${quantity} ${typeLabel}\n*Subtotal estimado:* ${currency} ${subtotal.toFixed(2)}\n\n*Enlace:* ${productUrl}\n\n¿Podrían indicarme los pasos a seguir?`;
    
    return `https://api.whatsapp.com/send?phone=${SITE_CONFIG.contact.whatsapp}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="bg-cream-100 p-6 rounded-2xl border border-brand-border shadow-sm">
      <h3 className="text-lg font-bold text-brand-text mb-4">Configurar Pedido</h3>

      {saleType === 'mixto' && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => { setSelectedType('docena'); setQuantity(1); }}
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition-colors ${selectedType === 'docena' ? 'border-gold bg-gold-light/20 text-gold-dark' : 'border-brand-border bg-white text-brand-muted hover:border-gold-light'}`}
          >
            Por Docena
          </button>
          <button
            onClick={() => { setSelectedType('unidad'); setQuantity(1); }}
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition-colors ${selectedType === 'unidad' ? 'border-gold bg-gold-light/20 text-gold-dark' : 'border-brand-border bg-white text-brand-muted hover:border-gold-light'}`}
          >
            Por Unidad
          </button>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-brand-text mb-2">
          Cantidad de {selectedType === 'docena' ? 'docenas' : 'unidades'}
        </label>
        <div className="flex items-center justify-between bg-white border border-brand-border rounded-lg p-1 w-48">
          <button onClick={handleDecrement} aria-label="Disminuir cantidad" className="w-10 h-10 flex items-center justify-center text-gold-dark hover:bg-cream-200 rounded-md transition-colors text-xl font-bold">−</button>
          <span className="font-bold text-brand-text text-lg" aria-live="polite">{quantity}</span>
          <button onClick={handleIncrement} aria-label="Aumentar cantidad" className="w-10 h-10 flex items-center justify-center text-gold-dark hover:bg-cream-200 rounded-md transition-colors text-xl font-bold">+</button>
        </div>
      </div>

      <div className="border-t border-brand-border pt-4">
        <div className="flex justify-between items-end mb-6">
          <span className="text-brand-muted font-semibold">Subtotal estimado:</span>
          <div className="text-right">
            <span className="text-gold-dark font-bold text-sm">{currency}</span>
            <span className="text-3xl font-bold text-brand-text ml-1">{subtotal.toFixed(2)}</span>
          </div>
        </div>

        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-md hover:bg-[#128C7E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Hacer Pedido por WhatsApp
        </a>
      </div>
    </div>
  );
};