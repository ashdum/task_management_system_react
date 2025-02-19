// File: src/components/modals/cardModal/ModalHeader.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  currentColumnTitle?: string;
  cardNumber: number;
  title: string;
  setTitle: (title: string) => void;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ currentColumnTitle, cardNumber, title, setTitle, onClose }) => (
  <div className="mb-6 relative">
    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
    >
      <X size={20} />
    </button>
    {/* Card metadata */}
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
      <span>in list <strong>{currentColumnTitle}</strong></span>
      <span>•</span>
      <span>Card #{cardNumber}</span>
    </div>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="text-xl font-semibold w-full focus:outline-none focus:border-b-2 focus:border-blue-500 mb-2"
    />
  </div>
);

export default ModalHeader;
