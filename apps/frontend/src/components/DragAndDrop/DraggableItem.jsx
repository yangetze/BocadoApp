import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import PropTypes from 'prop-types';

import React from 'react';

// ⚡ Bolt: Wrapped DraggableItem in React.memo to prevent expensive re-renders of the entire
// palette list during drag operations on the canvas. These items are largely static.
export const DraggableItem = React.memo(function DraggableItem({ id, item, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${id}`,
    data: { ...item, source: 'palette' }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const overlayStyle = isOverlay ? {
    boxShadow: '0px 10px 20px rgba(0,0,0,0.15)',
    cursor: 'grabbing',
    zIndex: 999
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...overlayStyle }}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border border-gray-100 rounded-xl shadow-sm cursor-grab hover:border-peach-soft hover:shadow-md transition-all flex items-center gap-3 ${isOverlay ? 'opacity-90' : ''}`}
    >
      <div className="w-10 h-10 rounded-lg bg-peach-soft/20 text-peach-soft flex items-center justify-center font-bold text-lg">
        {item.name.charAt(0)}
      </div>
      <div>
        <p className="font-medium text-slate-gray">{item.name}</p>
        <p className="text-xs text-gray-400">{item.globalCost !== undefined ? `${item.brand ? item.brand + ' • ' : ''}${item.unitQuantity || ''} ${item.measurementUnit || ''}`.trim() || `Ingrediente (${item.measurementUnit})` : item.type === 'baseRecipe' ? 'Receta Base' : 'Súper Receta'}</p>
      </div>
    </div>
  );
});

DraggableItem.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    globalCost: PropTypes.number,
    measurementUnit: PropTypes.string,
    unitQuantity: PropTypes.number,
    brand: PropTypes.string,
  }).isRequired,
  isOverlay: PropTypes.bool,
};
