import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function BrandSelectionModal ({ isOpen, onClose, onConfirm, superRecipesList }) {
  const [selections, setSelections] = useState({})

  // Extract unique generic ingredients from the given super recipes
  const uniqueIngredients = useMemo(() => {
    if (!superRecipesList) return []
    const ingredientsMap = new Map()

    superRecipesList.forEach(srWrapper => {
      const sr = srWrapper.originalItem
      if (!sr) return

      // Extract direct ingredients
      sr.directIngredients?.forEach(di => {
        if (!ingredientsMap.has(di.ingredientId)) {
          ingredientsMap.set(di.ingredientId, di.ingredient)
        }
      })

      // Extract ingredients from base recipes
      sr.baseRecipes?.forEach(br => {
        br.baseRecipe?.ingredients?.forEach(bri => {
          if (!ingredientsMap.has(bri.ingredientId)) {
            ingredientsMap.set(bri.ingredientId, bri.ingredient)
          }
        })
      })
    })

    return Array.from(ingredientsMap.values())
  }, [superRecipesList])

  // Set default selection if an ingredient only has 1 presentation, or null if it has multiple/none
  useEffect(() => {
    if (isOpen && uniqueIngredients.length > 0) {
      const initialSelections = {}
      uniqueIngredients.forEach(ing => {
        if (ing.presentations && ing.presentations.length > 0) {
          initialSelections[ing.id] = ing.presentations[0].id
        } else {
          initialSelections[ing.id] = null
        }
      })
      setSelections(initialSelections)
    }
  }, [isOpen, uniqueIngredients])

  if (!isOpen) return null

  const handleConfirm = () => {
    // Check if any ingredient with available presentations hasn't been selected
    const missingSelections = uniqueIngredients.some(ing =>
      ing.presentations && ing.presentations.length > 0 && !selections[ing.id]
    )

    if (missingSelections) {
      alert('Por favor, selecciona una presentación para todos los ingredientes posibles.')
      return
    }

    const brandSelectionsArray = Object.entries(selections)
      .filter(([_, presentationId]) => presentationId !== null)
      .map(([ingredientId, brandPresentationId]) => ({
        ingredientId,
        brandPresentationId
      }))

    onConfirm(brandSelectionsArray)
  }

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className='bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden'
        >
          {/* Header */}
          <div className='p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10'>
            <div>
              <h2 className='text-xl font-bold text-slate-gray'>Seleccionar Presentaciones</h2>
              <p className='text-sm text-gray-500 mt-1'>
                Elige qué marca/presentación exacta usarás para calcular el costo real.
              </p>
            </div>
            <button
              onClick={onClose}
              className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
            >
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className='p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-6'>
            {uniqueIngredients.length === 0
              ? (
                <div className='text-center text-gray-500 py-8'>
                  No se encontraron ingredientes genéricos en las recetas.
                </div>
                )
              : (
                  uniqueIngredients.map(ing => (
                    <div key={ing.id} className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
                      <div className='flex justify-between items-center mb-3'>
                        <h3 className='font-semibold text-slate-gray'>{ing.name}</h3>
                        <span className='text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-medium'>{ing.measurementUnit} (Base)</span>
                      </div>

                      {(!ing.presentations || ing.presentations.length === 0)
                        ? (
                          <div className='text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100/50'>
                            Este ingrediente genérico no tiene presentaciones de compra registradas. Se usará el costo estimado de ${Number(ing.globalPrice).toFixed(2) + ' / ' + (ing.globalPriceQuantity !== 1 ? ing.globalPriceQuantity + ' ' : '') + ing.measurementUnit}.
                          </div>
                          )
                        : (
                          <div className='space-y-2'>
                            {ing.presentations.map(p => (
                              <label key={p.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${selections[ing.id] === p.id ? 'border-peach-soft bg-peach-soft/5 ring-1 ring-peach-soft' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                <input
                                  type='radio'
                                  name={`ing-${ing.id}`}
                                  className='w-4 h-4 text-peach-soft border-gray-300 focus:ring-peach-soft accent-peach-soft'
                                  checked={selections[ing.id] === p.id}
                                  onChange={() => setSelections(prev => ({ ...prev, [ing.id]: p.id }))}
                                />
                                <div className='ml-3 flex-1 flex justify-between items-center'>
                                  <div>
                                 <span className='font-medium text-sm text-slate-gray'>{p.presentationName} {p.brand && `(${p.brand})`}</span>
                               </div>
                                  <div className='text-right'>
                                 <span className='text-sm font-semibold text-slate-gray'>${Number(p.cost).toFixed(2)}</span>
                                 <span className='text-xs text-gray-500 ml-1'>por {p.unitQuantity}{p.measurementUnit}</span>
                               </div>
                                </div>
                              </label>
                            ))}
                          </div>
                          )}
                    </div>
                  ))
                )}
          </div>

          {/* Footer */}
          <div className='p-5 border-t border-gray-100 bg-white z-10 flex justify-end gap-3'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors'
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className='px-6 py-2.5 rounded-xl text-sm font-medium bg-slate-gray text-white hover:bg-opacity-90 shadow-sm transition-all'
            >
              Confirmar y Guardar Presupuesto
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
