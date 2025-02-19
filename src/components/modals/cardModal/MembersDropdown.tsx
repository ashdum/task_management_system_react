// File: src/components/modals/cardModal/MembersDropdown.tsx
import React from 'react';
import { User, CardMember } from './types';

interface MembersDropdownProps {
  members: User[];
  selectedMembers: CardMember[];
  onToggleMember: (member: User) => void;
}

const MembersDropdown: React.FC<MembersDropdownProps> = ({ members, selectedMembers, onToggleMember }) => {
  // Function to get initials from email
  const getUserInitials = (email: string | undefined) => {
    if (!email) return '??';
    return email.split('@')[0].split('.').map(part => part[0].toUpperCase()).join('');
  };

  return (
    <div className="border rounded-lg bg-white p-2 space-y-1">
      {members.map((member) => (
        member && (
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
        )
      ))}
    </div>
  );
};

export default MembersDropdown;
