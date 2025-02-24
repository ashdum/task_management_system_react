// src\components\common\InfoTooltip.tsx
import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <Info size={16} />
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 min-w-[200px] shadow-lg ${
            positionClasses[position]
          }`}
        >
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              'right-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
          {content}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;