import { useState, useEffect } from 'react';
import Builder from '../DragAndDrop/Builder';
import { baseRecipeApi } from '../../api';
import { toast } from 'react-hot-toast';

export default function SuperRecipeBuilderWrapper() {
  const [baseRecipes, setBaseRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBaseRecipes();
  }, []);

  const fetchBaseRecipes = async () => {
    try {
      const data = await baseRecipeApi.getAll();
      setBaseRecipes(data);
    } catch (error) {
      toast.error(error.message || 'Error al cargar las recetas base para el constructor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando constructor de súper recetas...</div>;
  }

  return <Builder mode="superRecipe" availableItems={baseRecipes} />;
}
