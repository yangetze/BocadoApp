import PropTypes from "prop-types";
import React from "react";
import { Eraser, Save, Trash2 } from "lucide-react";

// (like dragging items in the canvas) updates. Since handlers are memoized via useCallback in the parent,
// this ensures the header only re-renders when its specific props change.
export const BuilderHeader = React.memo(function BuilderHeader({
  mode,
  onClear,
  onSave,
  isSaving,
  isEditing,
  onDelete,
}) {
  const titles = {
    superRecipe: isEditing ? "Modificar Súper Receta" : "Nueva Súper Receta",
    baseRecipe: isEditing ? "Modificar Receta Base" : "Nueva Receta Base",
    budget: isEditing ? "Modificar Presupuesto" : "Nuevo Presupuesto",
  };

  const descriptions = {
    superRecipe: "Construye tu producto final apilando recetas base.",
    baseRecipe:
      "Crea una receta combinando ingredientes y definiendo su rendimiento final.",
    budget: "Arma un pedido combinando múltiples súper recetas.",
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-gray mb-2">
          {titles[mode]}
        </h1>
        <p className="text-gray-500">{descriptions[mode]}</p>
      </div>

      <div className="flex gap-4 self-end md:self-auto w-full md:w-auto">
        <button
          onClick={onClear}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-slate-gray bg-gray-50 hover:bg-gray-100 font-medium transition-colors border border-gray-200"
          disabled={isSaving}
          aria-label="Limpiar lienzo"
        >
          <Eraser size={20} />
          <span className="hidden sm:inline">Limpiar</span>
        </button>
        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 font-medium transition-colors border border-red-200"
            disabled={isSaving}
            aria-label="Eliminar receta"
          >
            <Trash2 size={20} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        )}
        <button
          onClick={onSave}
          disabled={isSaving}
          aria-label="Guardar receta"
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white bg-slate-gray hover:bg-opacity-90 font-medium shadow-md shadow-slate-gray/20 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save size={20} />
          )}
          <span className="hidden sm:inline">
            {isSaving ? "Guardando..." : "Guardar"}
          </span>
        </button>
      </div>
    </div>
  );
});

BuilderHeader.propTypes = {
  mode: PropTypes.oneOf(["superRecipe", "baseRecipe", "budget"]).isRequired,
  onClear: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool,
  onDelete: PropTypes.func,
};
