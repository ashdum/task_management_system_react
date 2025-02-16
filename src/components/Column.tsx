import React, { useState, useEffect, useRef } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreVertical, Plus, Archive, Trash2 } from 'lucide-react';
import { Column as ColumnType } from '../types';
import Card from './Card';
import { useBoardStore } from '../store';
import NewCardModal from './NewCardModal';

interface Props {
  column: ColumnType;
  index: number;
  searchQuery: string;
}

const Column: React.FC<Props> = ({ column, index, searchQuery }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const { deleteColumn, archiveColumn, addCard } = useBoardStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCard = (title: string) => {
    addCard(column.id, title);
    setIsNewCardModalOpen(false);
  };

  const filteredCards = searchQuery
    ? column.cards.filter(
        card =>
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : column.cards;

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`bg-gray-100 p-4 rounded-lg w-80 flex-shrink-0 flex flex-col ${
            snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-40' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            height: 'fit-content',
            maxHeight: 'calc(100vh - 13rem)',
          }}
        >
          <div 
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{column.title}</h2>
              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                {filteredCards.length}
              </span>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setIsNewCardModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Plus size={16} />
                    Add New Task
                  </button>
                  <button
                    onClick={() => {
                      archiveColumn(column.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Archive size={16} />
                    Archive Column
                  </button>
                  <button
                    onClick={() => {
                      deleteColumn(column.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <Trash2 size={16} />
                    Delete Column
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <Droppable droppableId={column.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto min-h-[200px] ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
                style={{
                  minHeight: '200px',
                }}
              >
                {filteredCards.map((card, cardIndex) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    index={cardIndex}
                    columnId={column.id}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <button
            onClick={() => setIsNewCardModalOpen(true)}
            className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus size={20} />
            Add a card
          </button>

          <NewCardModal
            isOpen={isNewCardModalOpen}
            onClose={() => setIsNewCardModalOpen(false)}
            onAdd={handleAddCard}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Column;