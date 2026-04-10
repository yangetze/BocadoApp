import { useState, useCallback, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { budgetApi, superRecipeApi, baseRecipeApi } from '../../api';

export function useBuilder(mode, initialData = null) {
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [suggestedMargin, setSuggestedMargin] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [baseRecipeMetadata, setBaseRecipeMetadata] = useState({
    name: '',
    baseYield: '',
    yieldUnit: 'gr'
  });
  const [isBrandSelectionModalOpen, setIsBrandSelectionModalOpen] = useState(false);
  const [pendingBudgetPayload, setPendingBudgetPayload] = useState(null);

  useEffect(() => {
    if (initialData && mode === 'baseRecipe') {
      setBaseRecipeMetadata({
        name: initialData.name || '',
        baseYield: initialData.baseYield || '',
        yieldUnit: initialData.yieldUnit || 'gr'
      });

      if (initialData.ingredients && Array.isArray(initialData.ingredients)) {
        const loadedItems = initialData.ingredients.map(ing => ({
          ...ing.ingredient,
          id: `canvas-${Date.now()}-${ing.ingredient?.id || ing.ingredientId}`,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity
        }));
        setCanvasItems(loadedItems);
      }
    }
  }, [initialData, mode]);



  const fetchMarginRecommendation = useCallback(async (items) => {
    if (items.length === 0) {
      setSuggestedMargin(null);
      return;
    }
    const score = items.reduce((acc, curr) => acc + (curr.quantity || 1) * 3, 0);
    if (score > 20) setSuggestedMargin(50);
    else if (score > 10) setSuggestedMargin(40);
    else setSuggestedMargin(30);
  }, []);

  // ⚡ Bolt: Wrapped totalBaseRecipeCost calculation in useMemo to prevent an O(N) calculation
  // on every render of the Builder, especially during 60fps Drag & Drop interactions.
  // Impact: Reduces CPU overhead per render cycle for baseRecipe canvases by preventing redundant iteration.
  const totalBaseRecipeCost = useMemo(() => {
    return canvasItems.reduce((acc, item) => {
      if (mode === 'baseRecipe' && item.globalPrice !== undefined) {
        return acc + (item.quantity !== undefined ? item.quantity : 1) * (item.globalPrice / (item.globalPriceQuantity || 1));
      }
      return acc;
    }, 0);
  }, [canvasItems, mode]);


  const ingredientTotals = useMemo(() => {
    if (mode === 'budget') return [];

    const totalsMap = new Map();

    canvasItems.forEach(item => {
      const quantity = item.quantity !== undefined ? item.quantity : 1;

      if (mode === 'baseRecipe') {
        // En modo baseRecipe, canvasItems son ingredientes
        const ingredientId = item.ingredientId || item.id;
        const currentAmount = totalsMap.get(ingredientId)?.totalQuantity || 0;

        totalsMap.set(ingredientId, {
          name: item.name || item.ingredient?.name || 'Ingrediente desconocido',
          totalQuantity: currentAmount + quantity,
          measurementUnit: item.measurementUnit || item.ingredient?.measurementUnit || 'gr'
        });
      } else if (mode === 'superRecipe') {
        // En modo superRecipe, canvasItems son recetas base (o podrían ser ingredientes directos)
        // Por ahora, asumimos que son recetas base como está en el sistema actual
        if (item.ingredients && Array.isArray(item.ingredients) && item.baseYield) {
          const factor = quantity / item.baseYield;

          item.ingredients.forEach(brIng => {
            const ingredientId = brIng.ingredientId || brIng.ingredient?.id;
            if (!ingredientId) return;

            const ingQuantityInBaseRecipe = brIng.quantity || 0;
            const computedQuantity = ingQuantityInBaseRecipe * factor;

            const currentAmount = totalsMap.get(ingredientId)?.totalQuantity || 0;

            totalsMap.set(ingredientId, {
              name: brIng.ingredient?.name || 'Ingrediente desconocido',
              totalQuantity: currentAmount + computedQuantity,
              measurementUnit: brIng.ingredient?.measurementUnit || 'gr'
            });
          });
        }
      }
    });

    return Array.from(totalsMap.values());
  }, [canvasItems, mode]);

  const confirmBudgetSave = async (brandSelections) => {
    if (!pendingBudgetPayload) return;
    setIsSaving(true);
    try {
      const payload = {
        ...pendingBudgetPayload,
        brandSelections
      };
      await budgetApi.create(payload);
      toast.success('Presupuesto guardado exitosamente');
      setIsBrandSelectionModalOpen(false);
      setPendingBudgetPayload(null);
      setCanvasItems([]);
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al guardar el presupuesto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (canvasItems.length === 0) {
      toast.error('El lienzo está vacío. Agrega algunos elementos primero.');
      return;
    }

    if (mode !== 'budget') setIsSaving(true);

    try {
      if (mode === 'budget') {
        const payload = {
          customerName: 'Cliente ' + Date.now().toString().slice(-4),
          profitMargin: 0.35,
          userId: 'user-default-1',
          superRecipes: canvasItems.map(item => ({
            superRecipeId: item.id.replace(/^canvas-\d+-/, '') || item.id,
            scaleQuantity: item.quantity || 1,
            originalItem: item
          }))
        };
        setPendingBudgetPayload(payload);
        setIsBrandSelectionModalOpen(true);
      } else if (mode === 'superRecipe') {
        const payload = {
          name: 'Nueva Súper Receta ' + Date.now().toString().slice(-4),
          baseRecipes: canvasItems.map(item => ({
            baseRecipeId: item.id.replace(/^canvas-\d+-/, '') || item.id,
            quantityNeeded: item.quantity || 1
          }))
        };
        await superRecipeApi.create(payload);
        toast.success('Súper Receta guardada exitosamente');
      } else if (mode === 'baseRecipe') {
        if (!baseRecipeMetadata.name || !baseRecipeMetadata.baseYield) {
          toast.error('Debes colocar nombre y rendimiento de la receta');
          setIsSaving(false);
          return;
        }

        const payload = {
          name: baseRecipeMetadata.name,
          baseYield: parseFloat(baseRecipeMetadata.baseYield),
          yieldUnit: baseRecipeMetadata.yieldUnit,
          ingredients: canvasItems.map(item => ({
            ingredientId: item.id.replace(/^canvas-\d+-/, '') || item.id,
            quantityNeeded: item.quantity || 1
          }))
        };
        if (initialData && initialData.id) {
          await baseRecipeApi.update(initialData.id, payload);
        } else {
          await baseRecipeApi.create(payload);
        }
        toast.success('Receta Base guardada exitosamente');
        setBaseRecipeMetadata({ name: '', baseYield: '', yieldUnit: 'gr' });
        setCanvasItems([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al guardar. Verifica la consola.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeItem = useCallback((idToRemove) => {
    setCanvasItems((items) => {
      const newItems = items.filter((item) => item.id !== idToRemove);
      if (mode === 'superRecipe') fetchMarginRecommendation(newItems);
      return newItems;
    });
  }, [mode, fetchMarginRecommendation]);

  const updateItemQuantity = useCallback((idToUpdate, newQuantity) => {
    setCanvasItems((items) => {
      const newItems = items.map(item =>
        item.id === idToUpdate ? { ...item, quantity: newQuantity } : item
      );
      if (mode === 'superRecipe') fetchMarginRecommendation(newItems);
      return newItems;
    });
  }, [mode, fetchMarginRecommendation]);

  return {
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
    pendingBudgetPayload,
    confirmBudgetSave
  };
}
