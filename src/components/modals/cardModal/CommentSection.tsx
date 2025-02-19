// File: src/components/modals/cardModal/CommentSection.tsx
import React from 'react';
import CommentInput from './CommentInput';
import { Comment } from './types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  // Function to get user initials from email
  const getUserInitials = (email: string | undefined) => {
    if (!email) return '??';
    return email.split('@')[0].split('.').map(part => part[0].toUpperCase()).join('');
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">Comments</h3>
      <CommentInput onSubmit={onAddComment} />
      <div className="mt-4 space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">
                {getUserInitials(comment.userEmail)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.userEmail}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
