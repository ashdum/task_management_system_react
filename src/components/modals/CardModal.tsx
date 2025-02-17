import React, { useState, useRef, useEffect } from 'react';
import { 
  X, AlignLeft, Users, Tag, CheckSquare, Image, Paperclip, Clock, 
  MessageSquare, Plus, Trash2, Edit2 
} from 'lucide-react';
import { 
  Card, 
  User, 
  Label, 
  Checklist, 
  Comment, 
  ChecklistItem, 
  CardMember, 
  Attachment 
} from '../../types';
import { useBoardStore } from '../../store';
import { RichTextEditor } from '../common/RichTextEditor';
import AttachmentButton from '../AttachmentButton'; // Ensure this path is correct or update it to the correct path
import CommentInput from '../CommentInput';
import { getCurrentUser } from '../../lib/auth';

interface PredefinedLabel extends Label {
  id: string;
  text: string;
  color: string;
}

const PREDEFINED_LABELS: PredefinedLabel[] = [
  { id: 'label1', text: 'Bug', color: '#EF4444' },
  { id: 'label2', text: 'Feature', color: '#3B82F6' },
  { id: 'label3', text: 'Enhancement', color: '#10B981' },
  { id: 'label4', text: 'Documentation', color: '#8B5CF6' },
  { id: 'label5', text: 'Design', color: '#EC4899' },
  { id: 'label6', text: 'Question', color: '#F59E0B' },
];

interface CardModalProps {
  card: Card;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, columnId, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentDashboard, updateCard } = useBoardStore();
  const currentUser = getCurrentUser();

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [images, setImages] = useState<string[]>(card.images || []);
  const [members, setMembers] = useState<CardMember[]>(card.members || []);
  const [labels, setLabels] = useState<Label[]>(card.labels || []);
  const [checklists, setChecklists] = useState<Checklist[]>(card.checklists || []);
  const [comments, setComments] = useState<Comment[]>(card.comments || []);
  const [attachments, setAttachments] = useState<Attachment[]>(card.attachments || []);
  const [dueDate, setDueDate] = useState<string | undefined>(card.dueDate);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [activeMenu, setActiveMenu] = useState<'members' | 'labels' | 'checklist' | null>(null);
  const [editingChecklistItemId, setEditingChecklistItemId] = useState<string | null>(null);

  // Find the current column
  const currentColumn = currentDashboard?.columns.find(col => col.id === columnId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onloadend = () => {
            setImages(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleSave = () => {
    if (!currentUser) return;
    
    const updatedCard: Partial<Card> = {
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

  const toggleMember = (member: User) => {
    setMembers(prev => {
      const exists = prev.find(m => m.id === member.id);
      if (exists) {
        return prev.filter(m => m.id !== member.id);
      }
      const newMember: CardMember = {
        id: member.id,
        email: member.email
      };
      return [...prev, newMember];
    });
  };

  const toggleLabel = (label: Label) => {
    setLabels(prev => {
      const exists = prev.find(l => l.id === label.id);
      if (exists) {
        return prev.filter(l => l.id !== label.id);
      }
      return [...prev, label];
    });
  };

  const addChecklist = () => {
    if (!newChecklistTitle.trim()) return;

    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      title: newChecklistTitle,
      items: []
    };

    setChecklists(prev => [...prev, newChecklist]);
    setNewChecklistTitle('');
    setActiveMenu(null);
  };

  const addChecklistItem = (checklistId: string) => {
    if (!newChecklistItemText.trim()) return;

    const newItem: ChecklistItem = {
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

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(list => 
      list.id === checklistId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId
                ? { ...item, completed: !item.completed }
                : item
            ),
          }
        : list
    ));
  };

  const updateChecklistItem = (checklistId: string, itemId: string, newText: string) => {
    setChecklists(prev => prev.map(list => 
      list.id === checklistId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId
                ? { ...item, text: newText }
                : item
            ),
          }
        : list
    ));
    setEditingChecklistItemId(null);
  };

  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(list => 
      list.id === checklistId
        ? {
            ...list,
            items: list.items.filter(item => item.id !== itemId),
          }
        : list
    ));
  };

  const calculateProgress = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  const addComment = (text: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text,
      userId: currentUser.id,
      userEmail: currentUser.email,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newComment]);
  };

  const getUserInitials = (email: string | undefined) => {
    if (!email) return '??';
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg max-h-[90vh] w-full max-w-4xl flex">
        {/* Left side - Main content */}
        <div className="flex-grow p-6 overflow-y-auto relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>

          {/* Card info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>in list <strong>{currentColumn?.title}</strong></span>
              <span>•</span>
              <span>Card #{card.number}</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold w-full focus:outline-none focus:border-b-2 focus:border-blue-500 mb-2"
            />
            
            {/* Labels */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {labels.map(label => (
                  <span
                    key={label.id}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.text}
                    <button
                      onClick={() => toggleLabel(label)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Add a description..."
            />
          </div>

          {images.length > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {checklists.map((checklist) => (
            <div key={checklist.id} className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{checklist.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {calculateProgress(checklist)}%
                  </span>
                  <button
                    onClick={() => setChecklists(prev => prev.filter(list => list.id !== checklist.id))}
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

              {/* Checklist items */}
              <div className="space-y-2 mb-4">
                {checklist.items.map(item => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(checklist.id, item.id)}
                      className="mt-1.5"
                    />
                    {editingChecklistItemId === item.id ? (
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateChecklistItem(checklist.id, item.id, e.target.value)}
                        onBlur={() => setEditingChecklistItemId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateChecklistItem(checklist.id, item.id, item.text);
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
                            onClick={() => setEditingChecklistItemId(item.id)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteChecklistItem(checklist.id, item.id)}
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

              {/* Add new item input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItemText}
                  onChange={(e) => setNewChecklistItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newChecklistItemText.trim()) {
                      addChecklistItem(checklist.id);
                    }
                  }}
                  placeholder="Add an item..."
                  className="flex-1 px-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addChecklistItem(checklist.id)}
                  disabled={!newChecklistItemText.trim()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          ))}

          <div className="mb-6">
            <h3 className="font-medium mb-3">Comments</h3>
            <CommentInput onSubmit={addComment} />
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
        <div className="w-72 border-l p-6 bg-gray-50 flex flex-col gap-4 rounded-r-lg" ref={menuRef}>
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
                onFileSelect={handleImageUpload}
                onLinkAdd={handleLinkAdd}
              />
            </div>
          </div>

          {activeMenu === 'members' && currentDashboard?.members && (
            <div className="border rounded-lg bg-white p-2 space-y-1">
              {currentDashboard.members.map((member) => (
                member && (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      members.find(m => m.id === member.id)
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
                    {members.find(m => m.id === member.id) && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                )
              ))}
            </div>
          )}

          {activeMenu === 'labels' && (
            <div className="border rounded-lg bg-white p-2 space-y-1">
              {PREDEFINED_LABELS.map(label => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: label.color }}
                  >
                    {labels.find(l => l.id === label.id) && (
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
                onChange={(e) => setNewChecklistTitle(e.target.value)}
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
                  onClick={addChecklist}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;