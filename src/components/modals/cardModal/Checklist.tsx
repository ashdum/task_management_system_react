// File: src/components/modals/cardModal/Checklist.tsx
import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { Checklist as ChecklistType } from './types';

interface ChecklistProps {
  checklist: ChecklistType;
  newItemText: string;
  onNewItemTextChange: (text: string) => void;
  onAddItem: (checklistId: string) => void;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onUpdateItem: (checklistId: string, itemId: string, newText: string) => void;
  onDeleteItem: (checklistId: string, itemId: string) => void;
  onDeleteChecklist: (checklistId: string) => void;
  editingItemId: string | null;
  onSetEditingItemId: (id: string | null) => void;
}

const Checklist: React.FC<ChecklistProps> = ({
  checklist,
  newItemText,
  onNewItemTextChange,
  onAddItem,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
  onDeleteChecklist,
  editingItemId,
  onSetEditingItemId,
}) => {
  // Calculate progress percentage for checklist
  const calculateProgress = (list: ChecklistType) => {
    if (list.items.length === 0) return 0;
    const completed = list.items.filter(item => item.completed).length;
    return Math.round((completed / list.items.length) * 100);
  };

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{checklist.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{calculateProgress(checklist)}%</span>
          <button
            onClick={() => onDeleteChecklist(checklist.id)}
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded mb-4">
        <div
          className="h-full bg-blue-600 rounded transition-all duration-300"
          style={{ width: `${calculateProgress(checklist)}%` }}
        />
      </div>

      {/* Render each checklist item */}
      <div className="space-y-2 mb-4">
        {checklist.items.map(item => (
          <div key={item.id} className="flex items-start gap-2 group">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggleItem(checklist.id, item.id)}
              className="mt-1.5"
            />
            {editingItemId === item.id ? (
              <input
                type="text"
                value={item.text}
                onChange={(e) => onUpdateItem(checklist.id, item.id, e.target.value)}
                onBlur={() => onSetEditingItemId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdateItem(checklist.id, item.id, item.text);
                  }
                }}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className={item.completed ? 'line-through text-gray-500' : ''}>
                  {item.text}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onSetEditingItemId(item.id)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteItem(checklist.id, item.id)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input for adding new checklist item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => onNewItemTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newItemText.trim()) {
              onAddItem(checklist.id);
            }
          }}
          placeholder="Add an item..."
          className="flex-1 px-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => onAddItem(checklist.id)}
          disabled={!newItemText.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default Checklist;
