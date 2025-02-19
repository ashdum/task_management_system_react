import React from 'react';
import { X } from 'lucide-react';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: { id: string; email: string }[];
  selectedMembers: { id: string; email: string }[];
  onToggleMember: (member: { id: string; email: string }) => void;
}

const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  onClose,
  members,
  selectedMembers,
  onToggleMember,
}) => {
  if (!isOpen) return null;

  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Members</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => onToggleMember(member)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                selectedMembers.find(m => m.id === member.id)
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {getUserInitials(member.email)}
                </span>
              </div>
              <span className="text-sm truncate">{member.email}</span>
              {selectedMembers.find(m => m.id === member.id) && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;