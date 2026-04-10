import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

import PropTypes from 'prop-types';
import React from 'react';

// ⚡ Bolt: Wrapped Canvas in React.memo to prevent unnecessary re-renders of the drop area
// when parent state updates that don't affect the Canvas properties.
export const Canvas = React.memo(function Canvas({ items, mode, onRemove, onUpdateQuantity }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] lg:min-h-[400px] w-full rounded-2xl border-2 border-dashed p-4 lg:p-6 transition-colors duration-300 flex flex-col gap-4
        ${isOver ? 'border-peach-soft bg-peach-soft/5' : 'border-gray-200 bg-white/50'}`}
    >
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-gray">El lienzo está vacío</p>
          <p className="text-sm text-center">Arrastra elementos desde la paleta aquí o usa el botón +</p>
        </div>
      ) : (
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} item={item} mode={mode} onRemove={onRemove} onUpdateQuantity={onUpdateQuantity} />
          ))}
        </SortableContext>
      )}
    </div>
  );
});

Canvas.propTypes = {
  mode: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
};
