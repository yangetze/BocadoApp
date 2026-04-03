import React from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function SuperRecipeDetails({ item }) {
  return (
    <div className="flex-1">
      <p className="font-bold text-slate-gray text-lg">{item.name}</p>
      <p className="text-sm text-gray-500">
        {item.type === 'baseRecipe' ? 'Receta Base' : 'Súper Receta'}
      </p>
    </div>
  );
}

SuperRecipeDetails.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
  }).isRequired,
};

export function SuperRecipeActions({ id, item, onUpdateQuantity }) {
  return (
    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
      <button
        onClick={() => onUpdateQuantity(id, Math.max(0.5, (item.quantity || 1) - 0.5))}
        className="p-1 hover:bg-white rounded hover:shadow-sm text-gray-500 hover:text-slate-gray transition-all"
      >
        <ChevronDown size={16} />
      </button>
      <span className="w-12 text-center font-medium text-slate-gray select-none">
        {item.quantity || 1}
      </span>
      <button
        onClick={() => onUpdateQuantity(id, (item.quantity || 1) + 0.5)}
        className="p-1 hover:bg-white rounded hover:shadow-sm text-gray-500 hover:text-slate-gray transition-all"
      >
        <ChevronUp size={16} />
      </button>
      <span className="text-xs text-gray-400 ml-1 mr-2 select-none">x</span>
    </div>
  );
}

SuperRecipeActions.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.shape({
    quantity: PropTypes.number,
  }).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
};
