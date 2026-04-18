import React from "react";
import { Plus, Beaker, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function BaseRecipeList({
  recipes,
  onCreateNew,
  onEdit,
  loading,
  searchQuery,
  setSearchQuery
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-gray">
            Mis Recetas Base
          </h2>
          <p className="text-gray-500">
            Gestiona tus recetas base para usar en presupuestos y súper recetas.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 w-full md:max-w-md mt-4 sm:mt-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-peach-soft focus:border-peach-soft sm:text-sm transition-all"
            placeholder="Buscar receta base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={onCreateNew}
          className="hidden md:flex items-center justify-center gap-2 bg-slate-gray text-white px-5 py-2.5 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Receta Base
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-gray/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-peach-soft mb-4"></div>
          <p>Cargando recetas base...</p>
        </div>
      ) : (!recipes || recipes.length === 0) && !searchQuery ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-peach-soft/20 rounded-full flex items-center justify-center mb-6">
            <Beaker className="w-10 h-10 text-peach-soft" />
          </div>
          <h3 className="text-2xl font-bold text-slate-gray mb-2">
            Sin recetas base
          </h3>
          <p className="text-gray-500 max-w-md mb-8">
            Aún no has creado ninguna receta base. Crea tu primera receta para
            empezar a construir tus presupuestos y súper recetas.
          </p>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-slate-gray text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-sm shadow-slate-gray/20"
          >
            <Plus className="w-5 h-5" />
            Agrega tu primera receta base
          </button>
        </div>
      ) : (!recipes || recipes.length === 0) && searchQuery ? (
        <div className="text-center p-8 text-gray-500">
          No se encontraron resultados para "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-peach-soft/10 rounded-xl text-peach-soft">
                  <Beaker className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-lg">
                  Rendimiento: {recipe.baseYield} {recipe.yieldUnit}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-gray mb-2 group-hover:text-peach-soft transition-colors line-clamp-1">
                {recipe.name}
              </h3>

              <div className="mb-4 space-y-2 mt-auto">
                <p className="text-sm text-gray-500 mb-2">
                  Ingredientes ({recipe.ingredients?.length || 0}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients?.slice(0, 3).map((item, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100"
                    >
                      {item.ingredient?.name || "Desconocido"}
                    </span>
                  ))}
                  {(recipe.ingredients?.length || 0) > 3 && (
                    <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded-md border border-gray-100">
                      +{recipe.ingredients.length - 3} más
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 mt-auto flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onEdit(recipe)}
                  className="text-peach-soft hover:bg-peach-soft/10 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  Editar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MOBILE FAB (Floating Action Button) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onCreateNew}
          className="bg-slate-gray text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 active:scale-95 transition-all"
          aria-label="Nueva Receta Base"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
