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
import PropTypes from 'prop-types';

import { Palette } from './Palette';
import { Canvas } from './Canvas';
import { DraggableItem } from './DraggableItem';
import { SortableItem } from './SortableItem';

import { useCallback } from 'react';

import { useBuilder } from './useBuilder';
import { BuilderHeader } from './BuilderHeader';
import { MarginRecommendationCard } from './MarginRecommendationCard';
import { BaseRecipeMetadataForm } from './BaseRecipeMetadataForm';
import { IngredientsSummary } from './IngredientsSummary';

export default function Builder({ mode = 'superRecipe', availableItems = [] }) {
  const {
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
  } = useBuilder(mode);

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

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  // Memoize handlers passed to memoized components to prevent unnecessary re-renders
  const handleClear = useCallback(() => {
    setCanvasItems([]);
    setSuggestedMargin(null);
  }, [setCanvasItems, setSuggestedMargin]);

  const paletteTitle = mode === 'superRecipe' ? 'Recetas Base' : mode === 'baseRecipe' ? 'Ingredientes' : 'Súper Recetas';
  const paletteDescription = mode === 'superRecipe' ? 'Arrastra para armar tu Súper Receta' : mode === 'baseRecipe' ? 'Arrastra ingredientes a la receta' : 'Arrastra para armar tu Presupuesto';

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
            title={paletteTitle}
            description={paletteDescription}
          />
        </div>

        {/* Right Column: Canvas & Controls */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)] flex flex-col">
            <BuilderHeader
              mode={mode}
              onClear={handleClear}
              onSave={handleSave}
              isSaving={isSaving}
            />

            {mode === 'superRecipe' && (
              <MarginRecommendationCard suggestedMargin={suggestedMargin} />
            )}

            {mode === 'baseRecipe' && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-gray mb-1">Nombre de la Receta Base</label>
                  <input
                    type="text"
                    placeholder="Ej. Ganache de Chocolate"
                    className="w-full border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                    value={baseRecipeMetadata.name}
                    onChange={(e) => setBaseRecipeMetadata({ ...baseRecipeMetadata, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 h-[46px] flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 mr-2">Total:</span>
                    <span className="text-lg font-black text-slate-gray whitespace-nowrap">$ {totalBaseRecipeCost.toFixed(2)} USD</span>
                  </div>
                </div>
                <div className="md:col-span-1 lg:col-span-2">
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
              <BaseRecipeMetadataForm
                metadata={baseRecipeMetadata}
                setMetadata={setBaseRecipeMetadata}
                totalCost={totalBaseRecipeCost}
              />
            )}


            {/* The Canvas Area */}
            <div className="flex-1 flex flex-col">
              <Canvas
                items={canvasItems}
                mode={mode}
                onRemove={removeItem}
                onUpdateQuantity={updateItemQuantity}
              />

              {(mode === 'baseRecipe' || mode === 'superRecipe') && (
                <IngredientsSummary totals={ingredientTotals} />
              )}
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
