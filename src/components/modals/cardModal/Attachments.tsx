// File: src/components/modals/cardModal/Attachments.tsx
import React from 'react';
import { X } from 'lucide-react';

interface AttachmentsProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const Attachments: React.FC<AttachmentsProps> = ({ images, onRemoveImage }) => {
  return (
    <>
      {images.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Attachment ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Attachments;
