import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";

import PropTypes from "prop-types";
import React from "react";

// context forces updates, but memoizing individual items ensures that the un-dragged
// items don't re-render needlessly, significantly improving drag performance in long lists.
export const SortableItem = React.memo(function SortableItem({
  id,
  item,
  mode,
  onRemove,
  onUpdateQuantity,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
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
      className={`relative group bg-white border ${isDragging ? "border-peach-soft shadow-lg" : "border-gray-100 shadow-sm"} rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-peach-soft/50`}
    >
      <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
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
          {mode === "baseRecipe" ? (
            <p className="text-sm text-gray-500">
              {item.brand ? `${item.brand} • ` : ""}
              {item.unitQuantity} {item.measurementUnit}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {item.type === "baseRecipe" ? "Receta Base" : "Súper Receta"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 pl-10 sm:pl-0 mt-2 sm:mt-0">
        {/* Cost & Quantity Selector */}
        <div className="flex flex-col items-end gap-1 mr-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              aria-label="Cantidad"
              value={item.quantity !== undefined ? item.quantity : 1}
              onChange={(e) =>
                onUpdateQuantity(id, parseFloat(e.target.value) || 0)
              }
              className="w-20 text-center font-medium text-slate-gray border border-gray-200 rounded-lg p-1 outline-none focus:border-peach-soft focus:ring-1 focus:ring-peach-soft [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium text-gray-500 w-8">
              {mode === "baseRecipe" ? item.measurementUnit : "x"}
            </span>
          </div>
          {mode === "baseRecipe" && item.globalPrice !== undefined && item.unitQuantity && (
            <span className="text-sm font-bold text-slate-gray">
              ${" "}
              {(
                ((item.quantity !== undefined ? item.quantity : 1) /
                  item.unitQuantity) *
                (item.globalPrice / (item.globalPriceQuantity || 1))
              ).toFixed(2)}{" "}
              USD
            </span>
          )}
        </div>

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
});

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    quantity: PropTypes.number,
    brand: PropTypes.string,
    unitQuantity: PropTypes.number,
    measurementUnit: PropTypes.string,
    globalPrice: PropTypes.number,
  }).isRequired,
  mode: PropTypes.string,
  onRemove: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
};
