import React, { useState } from 'react';

interface ImageGalleryProps {
  productName: string;
  images: { url: string | null; is_primary: boolean }[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ productName, images }) => {
  const validImages = images.filter(img => img.url !== null) as { url: string; is_primary: boolean }[];

  const [mainImage, setMainImage] = useState<string>(
    validImages.find(i => i.is_primary)?.url || validImages[0]?.url || ''
  );

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-cream-100 rounded-2xl flex items-center justify-center border border-brand-border">
        <span className="text-brand-muted text-lg">Sin imágenes disponibles</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contenedor principal */}
      <div className="aspect-square rounded-2xl overflow-hidden border border-brand-border shadow-sm relative">
        {/* Capa blur de fondo con la imagen del proyecto — sin clases de animación de Astro */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${mainImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(24px)',
            transform: 'scale(1.15)', // evita bordes blancos del blur
            opacity: 0.55,
          }}
        />
        {/* Overlay suave con el color cream del proyecto */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'color-mix(in srgb, var(--color-cream-100, #faf7f2) 30%, transparent)',
          }}
        />
        {/* Imagen principal — object-contain para verla completa sin recorte */}
        <img
          key={mainImage} // fuerza re-render limpio al cambiar imagen
          src={mainImage}
          alt={productName}
          width="800"
          height="800"
          decoding="async"
          fetchPriority="high"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            // Transición CSS pura — no depende de View Transitions de Astro
            transition: 'opacity 0.25s ease',
          }}
        />
      </div>

      {/* Miniaturas */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMainImage(img.url)}
              className="aspect-square bg-cream-100 rounded-xl overflow-hidden focus:outline-none relative"
              style={{
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: mainImage === img.url
                  ? 'var(--color-gold, #c9a84c)'
                  : 'var(--color-brand-border, #e5e0d8)',
                opacity: mainImage === img.url ? 1 : 0.65,
                transform: mainImage === img.url ? 'scale(0.95)' : 'scale(1)',
                boxShadow: mainImage === img.url ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
                transition: 'border-color 0.2s ease, opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                if (mainImage !== img.url) {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-gold-light, #dfc27a)';
                }
              }}
              onMouseLeave={e => {
                if (mainImage !== img.url) {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.65';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-brand-border, #e5e0d8)';
                }
              }}
            >
              <img
                src={img.url}
                alt={`Vista ${idx + 1}`}
                width="200"
                height="200"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};