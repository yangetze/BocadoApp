import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import PropTypes from "prop-types";

import { Palette } from "./Palette";
import { Canvas } from "./Canvas";
import { ItemSearchSelect } from "./ItemSearchSelect";
import { DraggableItem } from "./DraggableItem";
import { SortableItem } from "./SortableItem";

import { useCallback, useState } from "react";
import { MobilePaletteModal } from "./MobilePaletteModal";
import { Plus } from "lucide-react";

import { toast } from "react-hot-toast";
import { useBuilder } from "./useBuilder";
import { BuilderHeader } from "./BuilderHeader";
import { MarginRecommendationCard } from "./MarginRecommendationCard";
import { BaseRecipeMetadataForm } from "./BaseRecipeMetadataForm";
import { BrandSelectionModal } from "./BrandSelectionModal";
import { IngredientsSummary } from "./IngredientsSummary";

export default function Builder({ mode = "superRecipe", availableItems = [], editingItem, onSuccess, initialData }) {
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);

  const {
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
  } = useBuilder(mode, editingItem || initialData, onSuccess);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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

    const isSourcePalette = active.data.current?.source === "palette";

    // 1. Drop from palette into canvas (empty area OR over existing item)
    if (isSourcePalette) {
      const exists = canvasItems.some((canvasItem) => {
        const baseId = canvasItem.id.replace(/^canvas-\d+-/, "");
        return baseId === active.data.current.id;
      });

      if (exists) {
        toast.error("Este elemento ya fue agregado. Puedes modificar su cantidad.");
        setActiveId(null);
        setActiveItem(null);
        return;
      }

      const isOverCanvas =
        over.id === "canvas" || canvasItems.some((i) => i.id === over.id);
      if (isOverCanvas) {
        const newItem = {
          ...active.data.current,
          id: `canvas-${Date.now()}-${active.data.current.id}`,
          quantity: 1,
        };
        setCanvasItems((items) => {
          let newItems = [...items];
          // Si soltamos sobre un elemento existente, lo insertamos justo después de él
          if (over.id !== "canvas") {
            const overIndex = items.findIndex((i) => i.id === over.id);
            if (overIndex !== -1) {
              newItems.splice(overIndex + 1, 0, newItem);
            } else {
              newItems.push(newItem);
            }
          } else {
            newItems.push(newItem);
          }

          if (mode === "superRecipe") fetchMarginRecommendation(newItems);
          return newItems;
        });
      }
    }
    // 2. Reordering inside the canvas
    else if (!isSourcePalette && over.id !== "canvas") {
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
          opacity: "0.4",
        },
      },
    }),
  };

  // Memoize handlers passed to memoized components to prevent unnecessary re-renders
  const handleClear = useCallback(() => {
    setCanvasItems([]);
    setSuggestedMargin(null);
  }, [setCanvasItems, setSuggestedMargin]);

  const handleAddItem = useCallback(
    (item) => {
      setIsPaletteModalOpen(false);

      setCanvasItems((items) => {
        const exists = items.some((canvasItem) => {
          const baseId = canvasItem.id.replace(/^canvas-\d+-/, "");
          return baseId === item.id;
        });

        if (exists) {
          toast.error("Este elemento ya fue agregado. Puedes modificar su cantidad.");
          return items;
        }

        const newItem = {
          ...item,
          id: `canvas-${Date.now()}-${item.id}`,
          quantity: 1,
        };

        const newItems = [...items, newItem];
        if (mode === "superRecipe") fetchMarginRecommendation(newItems);
        return newItems;
      });
    },
    [setCanvasItems, mode, fetchMarginRecommendation],
  );

  const paletteTitle =
    mode === "superRecipe"
      ? "Recetas Base"
      : mode === "baseRecipe"
        ? "Ingredientes"
        : "Súper Recetas";
  const paletteDescription =
    mode === "superRecipe"
      ? "Arrastra para armar tu Súper Receta"
      : mode === "baseRecipe"
        ? "Arrastra ingredientes a la receta"
        : "Arrastra para armar tu Presupuesto";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-8">
        {/* Left Column: Palette */}
        <div className="hidden lg:block lg:col-span-1">
          <Palette
            items={availableItems}
            title={paletteTitle}
            description={paletteDescription}
            onAdd={handleAddItem}
          />
        </div>

        {/* Right Column: Canvas & Controls */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-white rounded-3xl p-4 lg:p-8 shadow-sm border border-gray-100 lg:min-h-[calc(100vh-8rem)] flex flex-col">
            <BuilderHeader
              mode={mode}
              onClear={handleClear}
              onSave={handleSave}
              isSaving={isSaving}
              isEditing={isEditing}
              onDelete={handleDelete}
            />

            {mode === "superRecipe" && (
              <MarginRecommendationCard suggestedMargin={suggestedMargin} />
            )}

            {(mode === "superRecipe" || mode === "budget") && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="flex flex-col gap-4 max-w-2xl">
             <div className="flex flex-col gap-2">
                <label htmlFor="metadataName" className="text-sm font-bold text-slate-gray">{mode === "budget" ? 'Nombre del Cliente / Presupuesto *' : 'Nombre de Súper Receta *'}</label>
                <input
                  id="metadataName"
                  type="text"
                  placeholder={mode === "budget" ? 'Ej: Juan Pérez' : 'Ej: Pastel de bodas 3 pisos'}
                  value={superRecipeMetadata?.name || ''}
                  onChange={(e) => setSuperRecipeMetadata({ ...superRecipeMetadata, name: e.target.value })}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-peach-soft focus:ring-2 focus:ring-peach-soft/20 outline-none transition-all"
                />
             </div>
             <div className="flex flex-col gap-2">
                <label htmlFor="metadataDescription" className="text-sm font-bold text-slate-gray">Descripción</label>
                <textarea
                  id="metadataDescription"
                  placeholder="Detalles adicionales..."
                  value={superRecipeMetadata?.description || ''}
                  onChange={(e) => setSuperRecipeMetadata({ ...superRecipeMetadata, description: e.target.value })}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-peach-soft focus:ring-2 focus:ring-peach-soft/20 outline-none transition-all resize-none h-24"
                />
             </div>
             {mode === "budget" && (
                <>
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                    <label htmlFor="customCurrency" className="text-sm font-bold text-slate-gray">Sobrescribir Moneda (Opcional)</label>
                    <select
                      id="customCurrency"
                      value={superRecipeMetadata?.customCurrency || ''}
                      onChange={(e) => setSuperRecipeMetadata({ ...superRecipeMetadata, customCurrency: e.target.value })}
                      className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-peach-soft focus:ring-2 focus:ring-peach-soft/20 outline-none transition-all"
                    >
                      <option value="">Usar moneda por defecto del sistema</option>
                      <option value="USD">USD ($)</option>
                      <option value="VES">VES (Bs.)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <label htmlFor="customPolicies" className="text-sm font-bold text-slate-gray">Términos y Políticas Específicas</label>
                    <textarea
                      id="customPolicies"
                      placeholder="Sobrescribe las políticas globales para este presupuesto..."
                      value={superRecipeMetadata?.customPolicies || ''}
                      onChange={(e) => setSuperRecipeMetadata({ ...superRecipeMetadata, customPolicies: e.target.value })}
                      className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-peach-soft focus:ring-2 focus:ring-peach-soft/20 outline-none transition-all resize-none h-24"
                    />
                    <p className="text-xs text-gray-500">Dejar en blanco para usar las políticas por defecto.</p>
                  </div>
                </>
             )}

          </div>
        </div>
      )}

      {mode === "baseRecipe" && (
              <>
                <BaseRecipeMetadataForm
                  metadata={baseRecipeMetadata}
                  setMetadata={setBaseRecipeMetadata}
                  totalCost={totalBaseRecipeCost}
                />
              </>
            )}

            {/* Desktop Autocomplete Search */}
            <ItemSearchSelect items={availableItems} onAdd={handleAddItem} placeholder={mode === "baseRecipe" ? "Buscar ingrediente para agregar..." : mode === "superRecipe" ? "Buscar receta base para agregar..." : "Buscar súper receta para agregar..."} />

            {/* The Canvas Area */}
            <div className="flex-1 flex flex-col">
              <Canvas
                items={canvasItems}
                mode={mode}
                onRemove={removeItem}
                onUpdateQuantity={updateItemQuantity}
              />

              {/* Mobile Add Item Button */}
              <button
                type="button"
                onClick={() => setIsPaletteModalOpen(true)}
                className="w-full mt-4 lg:hidden flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-peach-soft text-peach-soft rounded-xl hover:bg-peach-soft/5 transition-colors font-medium"
              >
                <Plus size={20} />
                Agregar elemento
              </button>

              {mode === "budget" && (
                <button
                  type="button"
                  onClick={() => setIsBrandSelectionModalOpen(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border border-slate-gray text-slate-gray rounded-xl hover:bg-slate-gray hover:text-white transition-colors font-medium shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Seleccionar Presentaciones
                </button>
              )}

              {(mode === "baseRecipe" || mode === "superRecipe") && (
                <IngredientsSummary totals={ingredientTotals} />
              )}
            </div>
          </div>
        </div>
      </div>

      <MobilePaletteModal
        isOpen={isPaletteModalOpen}
        onClose={() => setIsPaletteModalOpen(false)}
      >
        <div className="h-full">
          <Palette
            items={availableItems}
            title={paletteTitle}
            description={paletteDescription}
            onAdd={handleAddItem}
          />
        </div>
      </MobilePaletteModal>

      {/* Drag Overlay for smooth animations while dragging */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeId ? (
          activeItem?.source === "palette" ? (
            <DraggableItem id={activeId} item={activeItem} isOverlay />
          ) : (
            <SortableItem
              id={activeId}
              item={activeItem}
              mode={mode}
              onRemove={() => {}}
              onUpdateQuantity={() => {}}
            />
          )
        ) : null}
      </DragOverlay>
      {mode === "budget" && (
        <BrandSelectionModal
          isOpen={isBrandSelectionModalOpen}
          onClose={() => setIsBrandSelectionModalOpen(false)}
          onConfirm={handleConfirmBrandSelections}
          initialSelections={brandSelections}
          superRecipesList={canvasItems}
        />
      )}
    </DndContext>
  );
}

Builder.propTypes = {
  mode: PropTypes.oneOf(["superRecipe", "baseRecipe", "budget"]),
  availableItems: PropTypes.array,
  editingItem: PropTypes.object,
  initialData: PropTypes.object,
  onSuccess: PropTypes.func,
};
