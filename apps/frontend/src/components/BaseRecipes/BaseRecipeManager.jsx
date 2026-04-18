import React, { useState, useEffect, useCallback } from "react";
import { baseRecipeApi } from "../../api";
import toast from "react-hot-toast";
import BaseRecipeList from "./BaseRecipeList";
import BaseRecipeBuilderWrapper from "./BaseRecipeBuilderWrapper";
import { ArrowLeft } from "lucide-react";

export default function BaseRecipeManager() {
  const [view, setView] = useState("list"); // 'list' or 'builder'
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [baseRecipes, setBaseRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBaseRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await baseRecipeApi.getAll(searchQuery);
      setBaseRecipes(data);
    } catch (error) {
      toast.error(error.message || "Error al cargar las recetas base");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (view === "list") {
        fetchBaseRecipes();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [view, fetchBaseRecipes]);

  if (view === "builder") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setView("list");
            setEditingRecipe(null);
          }}
          className="flex items-center gap-2 text-slate-gray hover:text-peach-soft transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </button>
        <BaseRecipeBuilderWrapper
          editingRecipe={editingRecipe}
          initialData={editingRecipe}
          onSuccess={() => {
            setView("list");
            setEditingRecipe(null);
          }}
        />
      </div>
    );
  }

  return (
    <BaseRecipeList
      recipes={baseRecipes}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      loading={loading}
      onCreateNew={() => {
        setEditingRecipe(null);
        setView("builder");
      }}
      onEdit={(recipe) => {
        setEditingRecipe(recipe);
        setView("builder");
      }}
    />
  );
}
