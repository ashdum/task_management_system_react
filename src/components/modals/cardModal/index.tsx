// File: src/components/modals/cardModal/index.tsx
import React, { useState, useRef } from 'react';

import RichTextEditorWrapper from './RichTextEditorWrapper';
import Attachments from './Attachments';
import Checklist from './Checklist';
import CommentSection from  './CommentSection';
import ModalSidebar from './ModalSidebar';
import { useOutsideClick, useImagePaste } from './hooks';
import { Label, Checklist as ChecklistType, Comment, CardMember, Attachment } from './types';
import { Card } from '../../../services/data/interface/dataTypes';
import { useBoardStore } from '../../board/useBoard';
import ModalHeader from './ModalHeader';
import authService from '../../../services/auth/authService';

interface CardModalProps {
  card: Card;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, columnId, isOpen, onClose }) => {
  // Reference for modal container
  const modalRef = useRef<HTMLDivElement>(null);
  // Reference for sidebar menu container
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentDashboard, updateCard } = useBoardStore();
  const currentUser = authService.getCurrentUser();

  // State for card fields
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [images, setImages] = useState<string[]>(card.images || []);
  const [members, setMembers] = useState<CardMember[]>(card.members || []);
  const [labels, setLabels] = useState<Label[]>(card.labels || []);
  const [checklists, setChecklists] = useState<ChecklistType[]>(card.checklists || []);
  const [comments, setComments] = useState<Comment[]>(card.comments || []);
  const [attachments, setAttachments] = useState<Attachment[]>(card.attachments || []);
  const [dueDate] = useState<string | undefined>(card.dueDate);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [activeMenu, setActiveMenu] = useState<'members' | 'labels' | 'checklist' | null>(null);
  const [editingChecklistItemId, setEditingChecklistItemId] = useState<string | null>(null);

  // Get current column from dashboard
  const currentColumn = currentDashboard?.columns.find(col => col.id === columnId);

  // Hook to handle clicks outside modal (closes modal)
  useOutsideClick(modalRef, onClose);
  // Hook to handle clicks outside sidebar (resets active menu)
  useOutsideClick(menuRef, () => setActiveMenu(null));
  // Hook to handle paste events for images
  useImagePaste((imageDataUrl) => {
    setImages(prev => [...prev, imageDataUrl]);
  });

  const handleSave = () => {
    if (!currentUser) return;
    // Create updated card object
    const updatedCard = {
      ...card,
      title,
      description,
      images,
      members,
      labels,
      checklists,
      comments,
      attachments,
      dueDate,
      updatedAt: new Date().toISOString()
    };
    updateCard(columnId, card.id, updatedCard);
    onClose();
  };

  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLinkAdd = (url: string) => {
    const newAttachment: Attachment = {
      id: `attachment-${Date.now()}`,
      name: url.split('/').pop() || 'Link',
      url,
      type: 'link',
      size: 0,
      createdAt: new Date().toISOString()
    };
    setAttachments(prev => [...prev, newAttachment]);
  };

  // Toggle member selection
  const toggleMember = (member: any) => {
    setMembers(prev => {
      const exists = prev.find(m => m.id === member.id);
      if (exists) {
        return prev.filter(m => m.id !== member.id);
      }
      return [...prev, { id: member.id, email: member.email }];
    });
  };

  // Toggle label selection
  const toggleLabel = (label: Label) => {
    setLabels(prev => {
      const exists = prev.find(l => l.id === label.id);
      if (exists) {
        return prev.filter(l => l.id !== label.id);
      }
      return [...prev, label];
    });
  };

  // Add new checklist
  const addChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    const newChecklist = {
      id: `checklist-${Date.now()}`,
      title: newChecklistTitle,
      items: []
    };
    setChecklists(prev => [...prev, newChecklist]);
    setNewChecklistTitle('');
    setActiveMenu(null);
  };

  // Add new checklist item
  const addChecklistItem = (checklistId: string) => {
    if (!newChecklistItemText.trim()) return;
    const newItem = {
      id: `item-${Date.now()}`,
      text: newChecklistItemText,
      completed: false
    };
    setChecklists(prev =>
      prev.map(list =>
        list.id === checklistId
          ? { ...list, items: [...list.items, newItem] }
          : list
      )
    );
    setNewChecklistItemText('');
  };

  // Toggle checklist item completed state
  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(list =>
      list.id === checklistId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : list
    ));
  };

  // Update checklist item text
  const updateChecklistItem = (checklistId: string, itemId: string, newText: string) => {
    setChecklists(prev => prev.map(list =>
      list.id === checklistId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, text: newText } : item
            )
          }
        : list
    ));
    setEditingChecklistItemId(null);
  };

  // Delete checklist item
  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(list =>
      list.id === checklistId
        ? { ...list, items: list.items.filter(item => item.id !== itemId) }
        : list
    ));
  };

  // Delete entire checklist
  const deleteChecklist = (checklistId: string) => {
    setChecklists(prev => prev.filter(list => list.id !== checklistId));
  };

  // Add new comment
  const addComment = (text: string) => {
    if (!currentUser) return;
    const newComment = {
      id: `comment-${Date.now()}`,
      text,
      userId: currentUser.id,
      userEmail: currentUser.email,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
  };

  // Remove image from attachments
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg max-h-[90vh] w-full max-w-4xl flex">
        {/* Left side - Main content */}
        <div className="flex-grow p-6 overflow-y-auto relative">
          <ModalHeader
            currentColumnTitle={currentColumn?.title}
            cardNumber={card.number}
            title={title}
            setTitle={setTitle}
            onClose={onClose}
          />
          <div className="mb-6">
            <RichTextEditorWrapper
              content={description}
              onChange={setDescription}
              placeholder="Add a description..."
            />
          </div>
          <Attachments images={images} onRemoveImage={removeImage} />
          {checklists.map((checklist) => (
            <Checklist
              key={checklist.id}
              checklist={checklist}
              newItemText={newChecklistItemText}
              onNewItemTextChange={setNewChecklistItemText}
              onAddItem={addChecklistItem}
              onToggleItem={toggleChecklistItem}
              onUpdateItem={updateChecklistItem}
              onDeleteItem={deleteChecklistItem}
              onDeleteChecklist={deleteChecklist}
              editingItemId={editingChecklistItemId}
              onSetEditingItemId={setEditingChecklistItemId}
            />
          ))}
          <CommentSection comments={comments} onAddComment={addComment} />
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
        {/* Right side - Sidebar */}
        <div ref={menuRef}>
          <ModalSidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            currentMembers={currentDashboard?.members || []}
            selectedMembers={members}
            onToggleMember={toggleMember}
            selectedLabels={labels}
            onToggleLabel={toggleLabel}
            newChecklistTitle={newChecklistTitle}
            onNewChecklistTitleChange={setNewChecklistTitle}
            onAddChecklist={addChecklist}
            onFileSelect={handleImageUpload}
            onLinkAdd={handleLinkAdd}
          />
        </div>
      </div>
    </div>
  );
};

export default CardModal;
