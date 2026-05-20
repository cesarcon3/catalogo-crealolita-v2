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
      <div className="aspect-square bg-cream-100 rounded-2xl overflow-hidden border border-brand-border shadow-sm">
        <img 
          src={mainImage} 
          alt={productName}
          width="800"
          height="800"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMainImage(img.url)}
              className={`aspect-square bg-cream-100 rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                mainImage === img.url 
                  ? 'border-gold shadow-md scale-95 opacity-100' 
                  : 'border-brand-border hover:border-gold-light opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={img.url} 
                alt={`Vista ${idx + 1}`} 
                width="200"
                height="200"
                loading="lazy"
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};