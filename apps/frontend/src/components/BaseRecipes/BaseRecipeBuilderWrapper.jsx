import { useState, useEffect } from "react";
import Builder from "../DragAndDrop/Builder";
import { ingredientApi } from "../../api";
import { toast } from "react-hot-toast";

export default function BaseRecipeBuilderWrapper({ editingRecipe, initialData, onSuccess }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await ingredientApi.getAll();
      setIngredients(data);
    } catch (error) {
      toast.error(error.message || "Error al cargar los ingredientes para la receta base");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando constructor...
      </div>
    );
  }

  return (
    <Builder
      mode="baseRecipe"
      availableItems={ingredients}
      editingItem={editingRecipe || initialData}
      onSuccess={onSuccess}
    />
  );
}
