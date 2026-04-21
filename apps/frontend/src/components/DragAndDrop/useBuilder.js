setSuperRecipeMetadata({
            name: editingItem.name || editingItem.customerName || "",import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { budgetApi, superRecipeApi, baseRecipeApi } from "../../api";

import { useEffect } from "react";
export function useBuilder(mode, editingItem = null, onSuccess = null) {
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [superRecipeMetadata, setSuperRecipeMetadata] = useState({
    name: editingItem?.name || editingItem?.customerName || '',
    description: editingItem?.description || '',
    customCurrency: editingItem?.customCurrency || '',
    customPolicies: editingItem?.customPolicies || '',
    customPaymentMethods: editingItem?.customPaymentMethods || []
  });
  const [suggestedMargin, setSuggestedMargin] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [baseRecipeMetadata, setBaseRecipeMetadata] = useState({
    name: "",
    baseYield: "",
    yieldUnit: "gr",
  });

  const [isBrandSelectionModalOpen, setIsBrandSelectionModalOpen] =
    useState(false);
  const [pendingBudgetPayload, setPendingBudgetPayload] = useState(null);
  const [brandSelections, setBrandSelections] = useState([]);

  useEffect(() => {
    if (editingItem && mode === "baseRecipe") {
      setIsEditing(true);
      setBaseRecipeMetadata({
        name: editingItem.name || "",
        baseYield: editingItem.baseYield?.toString() || "",
        yieldUnit: editingItem.yieldUnit || "gr",
      });
      if (editingItem.ingredients) {
        setCanvasItems(
          editingItem.ingredients.map((ing) => ({
            ...ing.ingredient,
            id: `canvas-${Date.now()}-${ing.ingredientId}`,
            quantity: ing.quantity,
            ingredientId: ing.ingredientId,
          })),
        );
      }
    } else if (editingItem && mode === "budget" && editingItem.brandSelections) {
      setBrandSelections(
        editingItem.brandSelections.map(bs => ({
          ingredientId: bs.ingredientId,
          brandPresentationId: bs.brandPresentationId
        }))
      );
    }
    if (editingItem && mode === "superRecipe") {
        setIsEditing(true);
        setSuperRecipeMetadata({
          name: editingItem.name || "",
          description: editingItem.description || "",
        });
        if (editingItem.baseRecipes) {
          setCanvasItems(
            editingItem.baseRecipes.map((br) => ({
              ...br.baseRecipe,
              id: `canvas-${Date.now()}-${br.baseRecipeId}`,
              quantity: br.quantityNeeded,
            })),
          );
        }
    } else if (editingItem && mode === "budget") {
        setIsEditing(true);
        setSuperRecipeMetadata({
            name: editingItem.customerName || "",
            description: "",
        });
        if (editingItem.superRecipes) {
            setCanvasItems(
                editingItem.superRecipes.map((sr) => ({
                    ...sr.superRecipe,
                    id: `canvas-${Date.now()}-${sr.superRecipeId}`,
                    quantity: sr.scaleQuantity,
                }))
            );
        }
    } else {
      setIsEditing(false);
      setBaseRecipeMetadata({ name: "", baseYield: "", yieldUnit: "gr" });
      setSuperRecipeMetadata({ name: "", description: "" });
      setCanvasItems([]);
    }
  }, [editingItem, mode]);

  const fetchMarginRecommendation = useCallback(async (items) => {
    if (items.length === 0) {
      setSuggestedMargin(null);
      return;
    }
    const score = items.reduce(
      (acc, curr) => acc + (curr.quantity || 1) * 3,
      0,
    );
    if (score > 20) setSuggestedMargin(50);
    else if (score > 10) setSuggestedMargin(40);
    else setSuggestedMargin(30);
  }, []);

  // ⚡ Bolt: Wrapped totalBaseRecipeCost calculation in useMemo to prevent an O(N) calculation
  // on every render of the Builder, especially during 60fps Drag & Drop interactions.
  // Impact: Reduces CPU overhead per render cycle for baseRecipe canvases by preventing redundant iteration.
  const totalBaseRecipeCost = useMemo(() => {
    return canvasItems.reduce((acc, item) => {
      if (mode === "baseRecipe" && item.globalPrice !== undefined) {
        return (
          acc +
          (item.quantity !== undefined ? item.quantity : 1) *
            (item.globalPrice / (item.globalPriceQuantity || 1))
        );
      }
      return acc;
    }, 0);
  }, [canvasItems, mode]);

  const ingredientTotals = useMemo(() => {
    if (mode === "budget") return [];

    const totalsMap = new Map();

    canvasItems.forEach((item) => {
      const quantity = item.quantity !== undefined ? item.quantity : 1;

      if (mode === "baseRecipe") {
        // En modo baseRecipe, canvasItems son ingredientes
        const ingredientId = item.ingredientId || item.id;
        const currentAmount = totalsMap.get(ingredientId)?.totalQuantity || 0;

        totalsMap.set(ingredientId, {
          name: item.name || item.ingredient?.name || "Ingrediente desconocido",
          totalQuantity: currentAmount + quantity,
          measurementUnit:
            item.measurementUnit || item.ingredient?.measurementUnit || "gr",
        });
      } else if (mode === "superRecipe") {
        // En modo superRecipe, canvasItems son recetas base (o podrían ser ingredientes directos)
        // Por ahora, asumimos que son recetas base como está en el sistema actual
        if (
          item.ingredients &&
          Array.isArray(item.ingredients) &&
          item.baseYield
        ) {
          const factor = quantity / item.baseYield;

          item.ingredients.forEach((brIng) => {
            const ingredientId = brIng.ingredientId || brIng.ingredient?.id;
            if (!ingredientId) return;

            const ingQuantityInBaseRecipe = brIng.quantity || 0;
            const computedQuantity = ingQuantityInBaseRecipe * factor;

            const currentAmount =
              totalsMap.get(ingredientId)?.totalQuantity || 0;

            totalsMap.set(ingredientId, {
              name: brIng.ingredient?.name || "Ingrediente desconocido",
              totalQuantity: currentAmount + computedQuantity,
              measurementUnit: brIng.ingredient?.measurementUnit || "gr",
            });
          });
        } else if (item.ingredients) {
            // Manejar ingredientes si vienen sin baseYield pero con un arreglo de ingredients
            // Esto sucede si el editingItem viene de la BD pero no se populó baseYield (lo cual sí debe estar, pero por si acaso)
            // O podemos ver que canvasItems[].ingredients no está llegando correctamente poblado
        }
      }
    });

    return Array.from(totalsMap.values());
  }, [canvasItems, mode]);

  const handleConfirmBrandSelections = (selections) => {
    setBrandSelections(selections);
    setIsBrandSelectionModalOpen(false);
  };

  const handleSave = async () => {
    if (canvasItems.length === 0) {
      toast.error("El lienzo está vacío. Agrega algunos elementos primero.");
      return;
    }

    if (mode !== "budget") setIsSaving(true);

    try {
      if (mode === "budget") {
        if (!superRecipeMetadata.name) {
          toast.error("Debes colocar el nombre del cliente/presupuesto");
          setIsSaving(false);
          return;
        }
        const payload = {
          customerName: superRecipeMetadata.name,
          profitMargin: 0.35, // This should ideally be editable later
          customCurrency: superRecipeMetadata.customCurrency || undefined,
          customPolicies: superRecipeMetadata.customPolicies || undefined,
          customPaymentMethods: superRecipeMetadata.customPaymentMethods || undefined,
          userId: "user-default-1",
          superRecipes: canvasItems.map((item) => ({
            superRecipeId: item.id.replace(/^canvas-\d+-/, "") || item.id,
            scaleQuantity: item.quantity || 1,
            originalItem: item,
          })),
        };
        try {
          if (isEditing) {
             await budgetApi.update(editingItem.id, payload);
             toast.success("Presupuesto actualizado exitosamente");
          } else {
             await budgetApi.create(payload);
             toast.success("Presupuesto guardado exitosamente");
          }
          setCanvasItems([]);
          if (onSuccess) onSuccess();
        } catch (error) {
          console.error(error);
          toast.error(error.message || "Hubo un error al guardar el presupuesto.");
        } finally {
          setIsSaving(false);
        }
      } else if (mode === "superRecipe") {
        if (!superRecipeMetadata.name) {
          toast.error("Debes colocar el nombre de la súper receta");
          setIsSaving(false);
          return;
        }

        // Group items by baseRecipeId to prevent unique constraint errors
        const groupedBaseRecipes = canvasItems.reduce((acc, item) => {
          const id = item.id.replace(/^canvas-\d+-/, "") || item.id;
          const existing = acc.find(x => x.baseRecipeId === id);
          if (existing) {
            existing.quantityNeeded += parseFloat(item.quantity || 1);
          } else {
            acc.push({
              baseRecipeId: id,
              quantityNeeded: parseFloat(item.quantity || 1),
            });
          }
          return acc;
        }, []);

        const payload = {
          name: superRecipeMetadata.name,
          description: superRecipeMetadata.description,
          baseRecipes: groupedBaseRecipes,
        };

        if (isEditing) {
          await superRecipeApi.update(editingItem.id, payload);
          toast.success("Súper Receta actualizada exitosamente");
        } else {
          await superRecipeApi.create(payload);
          toast.success("Súper Receta guardada exitosamente");
        }

        setCanvasItems([]);
        if (onSuccess) onSuccess();
      } else if (mode === "baseRecipe") {
        if (!baseRecipeMetadata.name || !baseRecipeMetadata.baseYield) {
          toast.error("Debes colocar nombre y rendimiento de la receta");
          setIsSaving(false);
          return;
        }



        // ⚡ Bolt: Group ingredients by ID before sending to backend.
        // This converts O(N) duplicate inserts into O(1) grouped updates,
        // reducing payload size and avoiding unique constraint violations.
        const groupedIngredients = canvasItems.reduce((acc, item) => {
          const id = item.id.replace(/^canvas-\d+-/, "") || item.id;
          const existing = acc.find(x => x.ingredientId === id);
          if (existing) {
            existing.quantity += parseFloat(item.quantity || 1);
          } else {
            acc.push({
              ingredientId: id,
              quantity: parseFloat(item.quantity || 1),
            });
          }
          return acc;
        }, []);

        const payload = {
          name: baseRecipeMetadata.name,
          baseYield: parseFloat(baseRecipeMetadata.baseYield),
          yieldUnit: baseRecipeMetadata.yieldUnit,
          ingredients: groupedIngredients,
        };
        if (isEditing) {
          await baseRecipeApi.update(editingItem.id, {
            name: payload.name,
            baseYield: payload.baseYield,
            yieldUnit: payload.yieldUnit,
            items: payload.ingredients,
          });
          toast.success("Receta Base actualizada exitosamente");
        } else {
          await baseRecipeApi.create(payload);
          toast.success("Receta Base guardada exitosamente");
        }
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al guardar. Verifica la consola.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta receta base?")
    ) {
      setIsSaving(true);
      try {
        await baseRecipeApi.delete(editingItem.id);
        toast.success("Receta Base eliminada exitosamente");
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Error al eliminar la receta base");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const removeItem = useCallback(
    (idToRemove) => {
      setCanvasItems((items) => {
        const newItems = items.filter((item) => item.id !== idToRemove);
        if (mode === "superRecipe") fetchMarginRecommendation(newItems);
        return newItems;
      });
    },
    [mode, fetchMarginRecommendation],
  );

  const updateItemQuantity = useCallback(
    (idToUpdate, newQuantity) => {
      setCanvasItems((items) => {
        const newItems = items.map((item) =>
          item.id === idToUpdate ? { ...item, quantity: newQuantity } : item,
        );
        if (mode === "superRecipe") fetchMarginRecommendation(newItems);
        return newItems;
      });
    },
    [mode, fetchMarginRecommendation],
  );

  return {
    isEditing,
    handleDelete,
    superRecipeMetadata,
    setSuperRecipeMetadata,
    canvasItems,
    setCanvasItems,
    activeId,
    setActiveId,
    activeItem,
    setActiveItem,
    suggestedMargin,
    setSuggestedMargin,
    isSaving,
    baseRecipeMetadata,
    setBaseRecipeMetadata,
    totalBaseRecipeCost,
    handleSave,
    removeItem,
    updateItemQuantity,
    fetchMarginRecommendation,
    ingredientTotals,
    isBrandSelectionModalOpen,
    setIsBrandSelectionModalOpen,
    brandSelections,
    handleConfirmBrandSelections,
  };
}
