import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Image as ImageIcon, Users } from 'lucide-react';
import { Card as CardType } from '../types';
import CardModal from './CardModal';

interface Props {
  card: CardType;
  index: number;
  columnId: string;
}

const Card: React.FC<Props> = ({ card, index, columnId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('');
  };

  // Function to safely render HTML content
  const renderDescription = () => {
    if (!card.description) return null;
    
    // Only show first 3 lines
    return (
      <div 
        className="text-gray-600 text-sm mt-2 line-clamp-3 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: card.description }}
      />
    );
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsModalOpen(true)}
            className={`group bg-white p-4 rounded-lg shadow mb-3 cursor-grab active:cursor-grabbing ${
              snapshot.isDragging 
                ? 'shadow-xl rotate-2 scale-[1.02] z-50'
                : 'hover:shadow-md transition-all duration-200'
            }`}
          >
            {/* Card number */}
            <div className="text-xs text-gray-500 mb-2">#{card.number}</div>
            
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map(label => (
                  <span
                    key={label.id}
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: label.color }}
                    title={label.text}
                  >
                    {label.text}
                  </span>
                ))}
              </div>
            )}
            
            {card.images && card.images.length > 0 && (
              <div className="mb-3 relative rounded-lg overflow-hidden h-32">
                <img
                  src={card.images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable="false"
                />
                {card.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                    <ImageIcon size={12} />
                    +{card.images.length - 1}
                  </div>
                )}
              </div>
            )}
            
            <h3 className="text-gray-800 font-medium">{card.title}</h3>
            {renderDescription()}

            <div className="mt-3 flex items-center justify-between">
              {card.members && card.members.length > 0 && (
                <div className="flex -space-x-2">
                  {card.members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-white"
                      title={member.email}
                    >
                      <span className="text-xs text-blue-600 font-medium">
                        {getUserInitials(member.email)}
                      </span>
                    </div>
                  ))}
                  {card.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white">
                      <span className="text-xs text-gray-600">
                        +{card.members.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {isModalOpen && (
        <CardModal
          card={card}
          columnId={columnId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Card;