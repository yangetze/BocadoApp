import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

import PropTypes from 'prop-types';

export function SortableItem({ id, item, mode, onRemove, onUpdateQuantity }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

        <div className="flex-1">
          <p className="font-bold text-slate-gray text-lg">{item.name}</p>
          {mode === 'baseRecipe' ? (
            <p className="text-sm text-gray-500">
              {item.brand ? `${item.brand} • ` : ''}{item.unitQuantity} {item.measurementUnit}
            </p>
          ) : (
            <p className="text-sm text-gray-500">{item.type === 'baseRecipe' ? 'Receta Base' : 'Súper Receta'}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Cost & Quantity Selector */}
        {mode === 'baseRecipe' && item.globalCost !== undefined && item.unitQuantity ? (
           <div className="flex flex-col items-end mr-4">
              <span className="text-sm font-bold text-slate-gray">
                $ {((item.quantity !== undefined ? item.quantity : 1) / item.unitQuantity * item.globalCost).toFixed(2)} USD
              </span>
              <span className="text-xs text-gray-400">Costo Calculado</span>
           </div>
        ) : null}

        {mode === 'baseRecipe' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              aria-label="Cantidad"
              value={item.quantity !== undefined ? item.quantity : 1}
              onChange={(e) => onUpdateQuantity(id, parseFloat(e.target.value) || 0)}
              className="w-20 text-center font-medium text-slate-gray border border-gray-200 rounded-lg p-1 outline-none focus:border-peach-soft focus:ring-1 focus:ring-peach-soft [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium text-gray-500">{item.measurementUnit}</span>
          </div>
        ) : (
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button
              onClick={() => onUpdateQuantity(id, Math.max(0.5, (item.quantity || 1) - 0.5))}
              className="p-1 hover:bg-white rounded hover:shadow-sm text-gray-500 hover:text-slate-gray transition-all"
              aria-label="Disminuir cantidad"
            >
              <ChevronDown size={16} />
            </button>
            <span className="w-12 text-center font-medium text-slate-gray select-none">
              {item.quantity || 1}
            </span>
            <button
              onClick={() => onUpdateQuantity(id, (item.quantity || 1) + 0.5)}
              className="p-1 hover:bg-white rounded hover:shadow-sm text-gray-500 hover:text-slate-gray transition-all"
              aria-label="Aumentar cantidad"
            >
              <ChevronUp size={16} />
            </button>
            <span className="text-xs text-gray-400 ml-1 mr-2 select-none">x</span>
          </div>
        )}

        {/* Action: Delete */}
        <button
          onClick={() => onRemove(id)}
          className="text-gray-300 hover:text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors"
          title="Eliminar del lienzo"
          aria-label="Eliminar del lienzo"
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
