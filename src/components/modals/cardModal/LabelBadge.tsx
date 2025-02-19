// File: src/components/modals/cardModal/LabelBadge.tsx
import React from 'react';
import { X } from 'lucide-react';
import { Label } from './types';

interface LabelBadgeProps {
  label: Label;
  onRemove: (label: Label) => void;
}

const LabelBadge: React.FC<LabelBadgeProps> = ({ label, onRemove }) => (
  // Render single label badge with remove button
  <span
    className="px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1"
    style={{ backgroundColor: label.color }}
  >
    {label.text}
    <button
      onClick={() => onRemove(label)}
      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
    >
      <X size={12} />
    </button>
  </span>
);

export default LabelBadge;
