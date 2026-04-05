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

  const handleClear = () => {
    setCanvasItems([]);
    setSuggestedMargin(null);
  };

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
