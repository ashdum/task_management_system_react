// File: src/components/CommentInput.tsx
import React, { useState } from 'react';

interface CommentInputProps {
  onSubmit: (text: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  // Handle submit on Enter key press (without shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSubmit(text);
        setText('');
      }
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="flex flex-col">
      <textarea
        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
      />
      <button
        onClick={handleSubmit}
        className="self-end mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </div>
  );
};

export default CommentInput;
