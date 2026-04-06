import PropTypes from 'prop-types';
<<<<<<< bolt/memoize-builder-components-8314505356496657583
import { memo } from 'react';

export const BuilderHeader = memo(function BuilderHeader({ mode, onClear, onSave, isSaving }) {
=======
import React from 'react';

// ⚡ Bolt: Wrapped BuilderHeader in React.memo to prevent unnecessary re-renders when parent state
// (like dragging items in the canvas) updates. Since handlers are memoized via useCallback in the parent,
// this ensures the header only re-renders when its specific props change.
export const BuilderHeader = React.memo(function BuilderHeader({ mode, onClear, onSave, isSaving }) {
>>>>>>> main
  const titles = {
    superRecipe: 'Nueva Súper Receta',
    baseRecipe: 'Nueva Receta Base',
    budget: 'Nuevo Presupuesto',
  };

  const descriptions = {
    superRecipe: 'Construye tu producto final apilando recetas base.',
    baseRecipe: 'Crea una receta combinando ingredientes y definiendo su rendimiento final.',
    budget: 'Arma un pedido combinando múltiples súper recetas.',
  };

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-gray mb-2">
          {titles[mode]}
        </h1>
        <p className="text-gray-500">
          {descriptions[mode]}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onClear}
          className="px-6 py-2.5 rounded-xl text-slate-gray bg-gray-50 hover:bg-gray-100 font-medium transition-colors border border-gray-200"
          disabled={isSaving}
        >
          Limpiar
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl text-white bg-slate-gray hover:bg-opacity-90 font-medium shadow-md shadow-slate-gray/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : null}
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
});

BuilderHeader.propTypes = {
  mode: PropTypes.oneOf(['superRecipe', 'baseRecipe', 'budget']).isRequired,
  onClear: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};
