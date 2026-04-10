import React, { useState, useEffect } from 'react';
import { superRecipeApi } from '../../api';
import toast from 'react-hot-toast';
import SuperRecipeList from './SuperRecipeList';
import SuperRecipeBuilderWrapper from './SuperRecipeBuilderWrapper';
import { ArrowLeft } from 'lucide-react';

export default function SuperRecipeManager() {
  const [view, setView] = useState('list'); // 'list' or 'builder'
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [superRecipes, setSuperRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuperRecipes = async () => {
    setLoading(true);
    try {
      const data = await superRecipeApi.getAll();
      setSuperRecipes(data);
    } catch (error) {
      toast.error('Error al cargar las súper recetas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchSuperRecipes();
    }
  }, [view]);

  const handleDelete = async (id) => {
    try {
      await superRecipeApi.delete(id);
      toast.success('Súper receta eliminada exitosamente');
      fetchSuperRecipes();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar la súper receta');
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setView('builder');
  };

  const handleCreateNew = () => {
    setEditingRecipe(null);
    setView('builder');
  };

  if (view === 'builder') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-slate-gray hover:text-peach-soft transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </button>
        <SuperRecipeBuilderWrapper initialData={editingRecipe} />
      </div>
    );
  }

  return (
    <SuperRecipeList
      recipes={superRecipes}
      loading={loading}
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
