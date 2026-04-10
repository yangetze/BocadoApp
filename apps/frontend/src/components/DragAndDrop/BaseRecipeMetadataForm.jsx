import PropTypes from "prop-types";

export function BaseRecipeMetadataForm({ metadata, setMetadata, totalCost }) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="md:col-span-2 lg:col-span-3">
        <label
          htmlFor="recipeName"
          className="block text-sm font-medium text-slate-gray mb-1"
        >
          Nombre de la Receta Base
        </label>
        <input
          id="recipeName"
          type="text"
          placeholder="Ej. Ganache de Chocolate"
          className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
          value={metadata.name}
          onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
        />
      </div>
      <div className="flex flex-col justify-end">
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 h-[46px] flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 mr-2">Total:</span>
          <span className="text-lg font-black text-slate-gray whitespace-nowrap">
            $ {totalCost.toFixed(2)} USD
          </span>
        </div>
      </div>
      <div className="md:col-span-1 lg:col-span-2">
        <label
          htmlFor="recipeYield"
          className="block text-sm font-medium text-slate-gray mb-1"
        >
          Rendimiento (Cantidad)
        </label>
        <input
          id="recipeYield"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ej. 1000"
          className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
          value={metadata.baseYield}
          onChange={(e) =>
            setMetadata({ ...metadata, baseYield: e.target.value })
          }
        />
      </div>
      <div>
        <label
          htmlFor="recipeUnit"
          className="block text-sm font-medium text-slate-gray mb-1"
        >
          Unidad de Rendimiento
        </label>
        <select
          id="recipeUnit"
          className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all bg-white"
          value={metadata.yieldUnit}
          onChange={(e) =>
            setMetadata({ ...metadata, yieldUnit: e.target.value })
          }
        >
          <option value="g">Gramos (g)</option>
          <option value="ml">Mililitros (ml)</option>
          <option value="kg">Kilogramos (kg)</option>
          <option value="l">Litros (l)</option>
          <option value="u">Unidades (u)</option>
        </select>
      </div>
    </div>
  );
}

BaseRecipeMetadataForm.propTypes = {
  metadata: PropTypes.shape({
    name: PropTypes.string.isRequired,
    baseYield: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    yieldUnit: PropTypes.string.isRequired,
  }).isRequired,
  setMetadata: PropTypes.func.isRequired,
  totalCost: PropTypes.number.isRequired,
};
