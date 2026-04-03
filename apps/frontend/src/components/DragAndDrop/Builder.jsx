import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Palette } from './Palette';
import { Canvas } from './Canvas';
import { DraggableItem } from './DraggableItem';
import { SortableItem } from './SortableItem';
import { budgetApi, superRecipeApi, baseRecipeApi } from '../../api';
import toast from 'react-hot-toast';

import PropTypes from 'prop-types';

export default function Builder({ mode = 'superRecipe', availableItems = [] }) {
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [suggestedMargin, setSuggestedMargin] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // API Call para obtener recomendación
  const fetchMarginRecommendation = useCallback(async (items) => {
    if (items.length === 0) {
      setSuggestedMargin(null);
      return;
    }

    // Como el endpoint /api/margins/recommend/ requiere un ID existente de SuperReceta en BD,
    // y aquí estamos construyendo una en tiempo real, simularamos la llamada o usaríamos un
    // nuevo endpoint de análisis de payload si el backend lo soportara.
    // Para MVP 2 (Integración), usaremos la lógica simulada temporalmente o llamaremos a la API si podemos.

    // Simulación alineada a la regla de negocio del backend
    const score = items.reduce((acc, curr) => acc + (curr.quantity || 1) * 3, 0);
    if (score > 20) setSuggestedMargin(50);
    else if (score > 10) setSuggestedMargin(40);
    else setSuggestedMargin(30);
  }, []);

  // Calcular total de receta base
  const totalBaseRecipeCost = canvasItems.reduce((acc, item) => {
    if (mode === 'baseRecipe' && item.globalCost !== undefined && item.unitQuantity) {
      return acc + ((item.quantity !== undefined ? item.quantity : 1) / item.unitQuantity) * item.globalCost;
    }
    return acc;
  }, 0);

  const [baseRecipeMetadata, setBaseRecipeMetadata] = useState({
    name: '',
    baseYield: '',
    yieldUnit: 'g'
  });

  const handleSave = async () => {
    if (canvasItems.length === 0) {
      toast.error('El lienzo está vacío. Agrega algunos elementos primero.');
      return;
    }

    setIsSaving(true);
    try {
      if (mode === 'budget') {
        const payload = {
          customerName: 'Cliente ' + Date.now().toString().slice(-4),
          profitMargin: 0.35, // Default or calculated
          userId: 'user-default-1', // Assuming a logged in user ID in a real scenario
          superRecipes: canvasItems.map(item => ({
            superRecipeId: item.id.replace('canvas-', '').split('-')[1] || item.id, // Extract real ID
            scaleQuantity: item.quantity || 1
          }))
        };
        await budgetApi.createBudget(payload);
        toast.success('Presupuesto guardado exitosamente');
      } else if (mode === 'superRecipe') {
        const payload = {
          name: 'Nueva Súper Receta ' + Date.now().toString().slice(-4),
          baseRecipes: canvasItems.map(item => ({
            baseRecipeId: item.id.replace('canvas-', '').split('-')[1] || item.id,
            quantity: item.quantity || 1
          }))
        };
        await superRecipeApi.createSuperRecipe(payload);
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
            ingredientId: item.id.replace('canvas-', '').split('-')[1] || item.id,
            quantity: item.quantity || 1
          }))
        };
        await baseRecipeApi.createBaseRecipe(payload);
        toast.success('Receta Base guardada exitosamente');
        setBaseRecipeMetadata({ name: '', baseYield: '', yieldUnit: 'g' });
        setCanvasItems([]);
      }
      // Opcional: limpiar lienzo después de guardar
      // setCanvasItems([]);
      // setSuggestedMargin(null);
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al guardar. Verifica la consola.');
    } finally {
      setIsSaving(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveItem(active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveItem(null);
      return;
    }

    const isSourcePalette = active.data.current?.source === 'palette';

    // 1. Drop from palette into canvas (empty area OR over existing item)
    if (isSourcePalette) {
      const isOverCanvas = over.id === 'canvas' || canvasItems.some(i => i.id === over.id);
      if (isOverCanvas) {
        const newItem = {
          ...active.data.current,
          id: `canvas-${Date.now()}-${active.data.current.id}`,
          quantity: 1,
        };
        setCanvasItems((items) => {
          let newItems = [...items];
          // Si soltamos sobre un elemento existente, lo insertamos justo después de él
          if (over.id !== 'canvas') {
            const overIndex = items.findIndex(i => i.id === over.id);
            if (overIndex !== -1) {
              newItems.splice(overIndex + 1, 0, newItem);
            } else {
              newItems.push(newItem);
            }
          } else {
            newItems.push(newItem);
          }

          if (mode === 'superRecipe') fetchMarginRecommendation(newItems);
          return newItems;
        });
      }
    }
    // 2. Reordering inside the canvas
    else if (!isSourcePalette && over.id !== 'canvas') {
      const oldIndex = canvasItems.findIndex((i) => i.id === active.id);
      const newIndex = canvasItems.findIndex((i) => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setCanvasItems((items) => arrayMove(items, oldIndex, newIndex));
      }
    }

    setActiveId(null);
    setActiveItem(null);
  };

  const removeItem = (idToRemove) => {
    setCanvasItems((items) => {
      const newItems = items.filter((item) => item.id !== idToRemove);
      if (mode === 'superRecipe') fetchMarginRecommendation(newItems);
      return newItems;
    });
  };

  const updateItemQuantity = (idToUpdate, newQuantity) => {
    setCanvasItems((items) => {
      const newItems = items.map(item =>
        item.id === idToUpdate ? { ...item, quantity: newQuantity } : item
      );
      if (mode === 'superRecipe') fetchMarginRecommendation(newItems);
      return newItems;
    });
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Palette */}
        <div className="lg:col-span-1">
          <Palette
            items={availableItems}
            title={mode === 'superRecipe' ? 'Recetas Base' : mode === 'baseRecipe' ? 'Ingredientes' : 'Súper Recetas'}
            description={mode === 'superRecipe' ? 'Arrastra para armar tu Súper Receta' : mode === 'baseRecipe' ? 'Arrastra ingredientes a la receta' : 'Arrastra para armar tu Presupuesto'}
          />
        </div>

        {/* Right Column: Canvas & Controls */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-gray mb-2">
                  {mode === 'superRecipe' ? 'Nueva Súper Receta' : mode === 'baseRecipe' ? 'Nueva Receta Base' : 'Nuevo Presupuesto'}
                </h1>
                <p className="text-gray-500">
                  {mode === 'superRecipe' ? 'Construye tu producto final apilando recetas base.' : mode === 'baseRecipe' ? 'Crea una receta combinando ingredientes y definiendo su rendimiento final.' : 'Arma un pedido combinando múltiples súper recetas.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => { setCanvasItems([]); setSuggestedMargin(null); }}
                  className="px-6 py-2.5 rounded-xl text-slate-gray bg-gray-50 hover:bg-gray-100 font-medium transition-colors border border-gray-200"
                  disabled={isSaving}
                >
                  Limpiar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-white bg-slate-gray hover:bg-opacity-90 font-medium shadow-md shadow-slate-gray/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : null}
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

            {/* AI Margin Recommendation Card (Only for SuperRecipes) */}
            {mode === 'superRecipe' && suggestedMargin !== null && (
              <div className="mb-8 p-6 bg-peach-soft/10 border border-peach-soft/30 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-gray text-lg">Recomendador de Margen (IA)</h3>
                    <p className="text-slate-gray/80 text-sm">
                      Basado en la complejidad de ensamblaje sugerimos un margen del:
                    </p>
                  </div>
                </div>
                <div className="text-4xl font-black text-peach-soft drop-shadow-sm">
                  {suggestedMargin}%
                </div>
              </div>
            )}

            {mode === 'baseRecipe' && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="md:col-span-3 flex justify-end mb-2">
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mr-2">Total Receta:</span>
                    <span className="text-xl font-black text-slate-gray">$ {totalBaseRecipeCost.toFixed(2)} USD</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">Nombre de la Receta Base</label>
                  <input
                    type="text"
                    placeholder="Ej. Ganache de Chocolate"
                    className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                    value={baseRecipeMetadata.name}
                    onChange={(e) => setBaseRecipeMetadata({ ...baseRecipeMetadata, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">Rendimiento (Cantidad)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 1000"
                    className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                    value={baseRecipeMetadata.baseYield}
                    onChange={(e) => setBaseRecipeMetadata({ ...baseRecipeMetadata, baseYield: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">Unidad de Rendimiento</label>
                  <select
                    className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all bg-white"
                    value={baseRecipeMetadata.yieldUnit}
                    onChange={(e) => setBaseRecipeMetadata({ ...baseRecipeMetadata, yieldUnit: e.target.value })}
                  >
                    <option value="g">Gramos (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="l">Litros (l)</option>
                    <option value="u">Unidades (u)</option>
                  </select>
                </div>
              </div>
            )}

            {/* The Canvas Area */}
            <div className="flex-1 flex flex-col">
              <Canvas
                items={canvasItems}
                mode={mode}
                onRemove={removeItem}
                onUpdateQuantity={updateItemQuantity}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay for smooth animations while dragging */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeId ? (
          activeItem?.source === 'palette' ? (
            <DraggableItem id={activeId} item={activeItem} isOverlay />
          ) : (
            <SortableItem id={activeId} item={activeItem} mode={mode} onRemove={() => {}} onUpdateQuantity={() => {}} />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

Builder.propTypes = {
  mode: PropTypes.oneOf(['superRecipe', 'baseRecipe', 'budget']),
  availableItems: PropTypes.array,
};
