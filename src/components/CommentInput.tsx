import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

interface CommentInputProps {
  onSubmit: (text: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {!isTyping && !text && (
        <div
          className="absolute inset-0 flex items-center px-4 py-2 text-gray-500 cursor-text"
          onClick={() => {
            setIsTyping(true);
            textareaRef.current?.focus();
          }}
        >
          <MessageSquare size={20} className="mr-2" />
          Write a comment...
        </div>
      )}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
          onKeyDown={handleKeyDown}
          placeholder=""
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[2.5rem] resize-none"
          style={{ minHeight: isTyping ? '6rem' : '2.5rem' }}
        />
        {(isTyping || text) && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        )}
      </div>
      {isTyping && (
        <p className="mt-1 text-xs text-gray-500">
          Press Enter to submit, Shift + Enter for new line
        </p>
      )}
    </div>
  );
}

export default CommentInput;