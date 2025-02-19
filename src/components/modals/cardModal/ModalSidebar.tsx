// File: src/components/modals/cardModal/ModalSidebar.tsx
import React from 'react';
import { Users, Tag, CheckSquare } from 'lucide-react';
import MembersDropdown from './MembersDropdown';
import { CardMember, Label, User } from './types';
import AttachmentButton from '../../AttachmentButton';

interface ModalSidebarProps {
  activeMenu: 'members' | 'labels' | 'checklist' | null;
  setActiveMenu: (menu: 'members' | 'labels' | 'checklist' | null) => void;
  // Members dropdown props
  currentMembers: User[]; // Ideally: User[]
  selectedMembers: CardMember[];  // Ideally: CardMember[]
  onToggleMember: (member: any) => void;
  // Labels props
  selectedLabels: Label[];
  onToggleLabel: (label: Label) => void;
  // Checklist props
  newChecklistTitle: string;
  onNewChecklistTitleChange: (title: string) => void;
  onAddChecklist: () => void;
  // Attachment handling
  onFileSelect: (files: FileList) => void;
  onLinkAdd: (url: string) => void;
}

const PREDEFINED_LABELS: Label[] = [
  { id: 'label1', text: 'Bug', color: '#EF4444' },
  { id: 'label2', text: 'Feature', color: '#3B82F6' },
  { id: 'label3', text: 'Enhancement', color: '#10B981' },
  { id: 'label4', text: 'Documentation', color: '#8B5CF6' },
  { id: 'label5', text: 'Design', color: '#EC4899' },
  { id: 'label6', text: 'Question', color: '#F59E0B' },
];

const ModalSidebar: React.FC<ModalSidebarProps> = ({
  activeMenu,
  setActiveMenu,
  currentMembers,
  selectedMembers,
  onToggleMember,
  selectedLabels,
  onToggleLabel,
  newChecklistTitle,
  onNewChecklistTitleChange,
  onAddChecklist,
  onFileSelect,
  onLinkAdd,
}) => {
  return (
    <div className="w-72 border-l p-6 bg-gray-50 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Add to card</h3>
        <div className="space-y-2">
          <button
            onClick={() => setActiveMenu(activeMenu === 'members' ? null : 'members')}
            className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Users size={20} />
            <span>Members</span>
          </button>
          <button
            onClick={() => setActiveMenu(activeMenu === 'labels' ? null : 'labels')}
            className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Tag size={20} />
            <span>Labels</span>
          </button>
          <button
            onClick={() => setActiveMenu(activeMenu === 'checklist' ? null : 'checklist')}
            className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CheckSquare size={20} />
            <span>Checklist</span>
          </button>
          <AttachmentButton
            onFileSelect={onFileSelect}
            onLinkAdd={onLinkAdd}
          />
        </div>
      </div>
      {activeMenu === 'members' && currentMembers && (
        <MembersDropdown
          members={currentMembers}
          selectedMembers={selectedMembers}
          onToggleMember={onToggleMember}
        />
      )}
      {activeMenu === 'labels' && (
        <div className="border rounded-lg bg-white p-2 space-y-1">
          {PREDEFINED_LABELS.map(label => (
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
      )}
      {activeMenu === 'checklist' && (
        <div className="border rounded-lg bg-white p-4">
          <h4 className="font-medium mb-3">Add Checklist</h4>
          <input
            type="text"
            value={newChecklistTitle}
            onChange={(e) => onNewChecklistTitleChange(e.target.value)}
            placeholder="Checklist title..."
            className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveMenu(null)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onAddChecklist}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalSidebar;
