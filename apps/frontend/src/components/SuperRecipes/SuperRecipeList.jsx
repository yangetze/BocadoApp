import React, { useState, useMemo } from 'react';
import { Plus, ChefHat, ChevronRight, Search, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeString } from '../../utils/stringUtils';
import { confirmDelete } from '../../utils/toastUtils';

export default function SuperRecipeList({ recipes, onCreateNew, onEdit, onDelete, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ⚡ Bolt: Pre-calculate normalized names when recipes change, not on every keystroke
  const normalizedRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.map(recipe => ({
      ...recipe,
      _normalizedName: normalizeString(recipe.name)
    }));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    if (!searchTerm) return normalizedRecipes;
    const normalizedSearch = normalizeString(searchTerm);
    return normalizedRecipes.filter(recipe => recipe._normalizedName.includes(normalizedSearch));
  }, [normalizedRecipes, searchTerm]);

  const totalPages = Math.ceil((filteredRecipes?.length || 0) / itemsPerPage);

  const currentRecipes = useMemo(() => {
    if (!filteredRecipes) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecipes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecipes, currentPage]);


  const recipeCards = useMemo(() => {
    return currentRecipes.map((recipe, index) => (
      <motion.div
        key={recipe.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-peach-soft/10 rounded-xl text-peach-soft">
            <ChefHat className="w-6 h-6" />
          </div>
          <button
            onClick={() => {
              confirmDelete('¿Estás seguro de que deseas eliminar esta súper receta?', () => {
                onDelete(recipe.id);
              });
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Eliminar súper receta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-gray mb-2 group-hover:text-peach-soft transition-colors line-clamp-1">
          {recipe.name}
        </h3>

        {recipe.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
            {recipe.description}
          </p>
        )}

        <div className="mb-4 space-y-2 mt-auto">
          {(recipe.baseRecipes?.length > 0) && (
             <div className="text-xs">
                <span className="font-semibold text-slate-gray">Recetas Base: </span>
                <span className="text-gray-500">{recipe.baseRecipes.length}</span>
             </div>
          )}
           {(recipe.directIngredients?.length > 0) && (
             <div className="text-xs">
                <span className="font-semibold text-slate-gray">Ingredientes Extra: </span>
                <span className="text-gray-500">{recipe.directIngredients.length}</span>
             </div>
          )}
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
    ));
  }, [currentRecipes, onDelete, onEdit, confirmDelete]);

  if (loading) {

    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-gray/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-peach-soft mb-4"></div>
        <p>Cargando súper recetas...</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-peach-soft/20 rounded-full flex items-center justify-center mb-6">
          <ChefHat className="w-10 h-10 text-peach-soft" />
        </div>
        <h3 className="text-2xl font-bold text-slate-gray mb-2">Sin súper recetas</h3>
        <p className="text-gray-500 max-w-md mb-8">
          Aún no has creado ninguna súper receta. Combina tus recetas base y otros ingredientes para crear preparaciones más complejas.
        </p>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-slate-gray text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Crear mi primera súper receta
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-gray">Mis Súper Recetas</h2>
          <p className="text-gray-500 text-sm">Gestiona tus preparaciones complejas.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="hidden md:flex items-center justify-center gap-2 bg-slate-gray text-white px-5 py-2.5 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Súper Receta
        </button>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onCreateNew}
          className="bg-slate-gray text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 active:scale-95 transition-all"
          aria-label="Nueva Súper Receta"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar súper receta por nombre..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-peach-soft focus:ring-2 focus:ring-peach-soft/20 outline-none transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {currentRecipes.length === 0 && searchTerm && (
        <div className="text-center p-8 text-gray-500">
          No se encontraron resultados para "{searchTerm}"
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipeCards}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-slate-gray disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-slate-gray disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
