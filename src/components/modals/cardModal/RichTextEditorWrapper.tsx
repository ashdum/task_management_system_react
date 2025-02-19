// File: src/components/modals/cardModal/RichTextEditorWrapper.tsx
import React from 'react';
import { RichTextEditor } from '../../common/RichTextEditor';

interface RichTextEditorWrapperProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditorWrapper: React.FC<RichTextEditorWrapperProps> = ({ content, onChange, placeholder }) => {
  return (
    <div className="mb-6">
      <RichTextEditor content={content} onChange={onChange} placeholder={placeholder} />
    </div>
  );
};

export default RichTextEditorWrapper;
