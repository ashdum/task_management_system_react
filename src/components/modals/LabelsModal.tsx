import React from 'react';
import { X } from 'lucide-react';
import { Label } from '../../types';

interface LabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: Label[];
  selectedLabels: Label[];
  onToggleLabel: (label: Label) => void;
}

const LabelsModal: React.FC<LabelsModalProps> = ({
  isOpen,
  onClose,
  labels,
  selectedLabels,
  onToggleLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Labels</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {labels.map(label => (
            <button
              key={label.id}
              onClick={() => onToggleLabel(label)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: label.color }}
              >
                {selectedLabels.find(l => l.id === label.id) && (
                  <span className="text-white">✓</span>
                )}
              </div>
              <span className="text-sm">{label.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabelsModal;