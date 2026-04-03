import React from 'react';
import PropTypes from 'prop-types';

export function BaseRecipeDetails({ item }) {
  return (
    <div className="flex-1">
      <p className="font-bold text-slate-gray text-lg">{item.name}</p>
      <p className="text-sm text-gray-500">
        {item.brand ? `${item.brand} • ` : ''}{item.unitQuantity} {item.measurementUnit}
      </p>
    </div>
  );
}

BaseRecipeDetails.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    brand: PropTypes.string,
    unitQuantity: PropTypes.number,
    measurementUnit: PropTypes.string,
  }).isRequired,
};

export function BaseRecipeActions({ id, item, onUpdateQuantity }) {
  return (
    <>
      {item.globalCost !== undefined && item.unitQuantity ? (
        <div className="flex flex-col items-end mr-4">
          <span className="text-sm font-bold text-slate-gray">
            $ {((item.quantity !== undefined ? item.quantity : 1) / item.unitQuantity * item.globalCost).toFixed(2)} USD
          </span>
          <span className="text-xs text-gray-400">Costo Calculado</span>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.quantity !== undefined ? item.quantity : 1}
          onChange={(e) => onUpdateQuantity(id, parseFloat(e.target.value) || 0)}
          className="w-20 text-center font-medium text-slate-gray border border-gray-200 rounded-lg p-1 outline-none focus:border-peach-soft focus:ring-1 focus:ring-peach-soft [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-sm font-medium text-gray-500">{item.measurementUnit}</span>
      </div>
    </>
  );
}

BaseRecipeActions.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.shape({
    quantity: PropTypes.number,
    globalCost: PropTypes.number,
    unitQuantity: PropTypes.number,
    measurementUnit: PropTypes.string,
  }).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
};
