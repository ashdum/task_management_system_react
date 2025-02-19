import React from 'react';
import { Paperclip } from 'lucide-react';

interface AttachmentButtonProps {
  onFileSelect: (files: FileList) => void;
  onLinkAdd: (url: string) => void;
}

const AttachmentButton: React.FC<AttachmentButtonProps> = ({
  onFileSelect,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  return (
    <div className="relative">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Paperclip size={20} />
        <span>Attach</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            onFileSelect(e.target.files);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default AttachmentButton;