import React from 'react';
import PropTypes from 'prop-types';
import { Trash2, GripVertical } from 'lucide-react';
import { useSortableItem } from './useSortableItem';
import { BaseRecipeDetails, BaseRecipeActions } from './BaseRecipeComponents';
import { SuperRecipeDetails, SuperRecipeActions } from './SuperRecipeComponents';

export function SortableItem({ id, item, mode, onRemove, onUpdateQuantity }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
  } = useSortableItem(id);

  const isBaseRecipeMode = mode === 'baseRecipe';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white border ${isDragging ? 'border-peach-soft shadow-lg' : 'border-gray-100 shadow-sm'} rounded-xl p-4 flex items-center justify-between gap-4 transition-colors hover:border-peach-soft/50`}
    >
      <div className="flex items-center gap-4 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-peach-soft text-gray-400 p-1"
        >
          <GripVertical size={20} />
        </div>

        <div className="w-12 h-12 rounded-lg bg-slate-gray/5 text-slate-gray flex items-center justify-center font-bold text-xl flex-shrink-0">
          {item.name.charAt(0)}
        </div>

        {isBaseRecipeMode ? (
          <BaseRecipeDetails item={item} />
        ) : (
          <SuperRecipeDetails item={item} />
        )}
      </div>

      <div className="flex items-center gap-6">
        {isBaseRecipeMode ? (
          <BaseRecipeActions id={id} item={item} onUpdateQuantity={onUpdateQuantity} />
        ) : (
          <SuperRecipeActions id={id} item={item} onUpdateQuantity={onUpdateQuantity} />
        )}

        <button
          onClick={() => onRemove(id)}
          className="text-gray-300 hover:text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors"
          title="Eliminar del lienzo"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    quantity: PropTypes.number,
    brand: PropTypes.string,
    unitQuantity: PropTypes.number,
    measurementUnit: PropTypes.string,
    globalCost: PropTypes.number,
  }).isRequired,
  mode: PropTypes.string,
  onRemove: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
};
