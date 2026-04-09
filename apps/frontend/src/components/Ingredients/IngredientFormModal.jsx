import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UNITS = ['gr', 'kg', 'ml', 'l', 'u'];

export default function IngredientFormModal({ isOpen, onClose, onSave, initialData }) {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    globalPrice: '',
    globalPriceQuantity: '1000',
    measurementUnit: 'gr',
    presentations: []
  });

  const [currentPresentation, setCurrentPresentation] = useState({
    presentationName: '',
    brand: '',
    cost: '',
    unitQuantity: '1',
    measurementUnit: 'gr'
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData, presentations: initialData.presentations || [] });
      } else {
        setFormData({ name: '', globalPrice: '', globalPriceQuantity: '1000', measurementUnit: 'gr', presentations: [] });
        setCurrentPresentation({
          presentationName: '',
          brand: '',
          cost: '',
          unitQuantity: '1',
          measurementUnit: 'gr'
        });
      }
    }
  }, [isOpen, initialData]);

  const calculateAveragePrice = () => {
    if (formData.presentations && formData.presentations.length > 0) {
      let totalCostPerBaseUnit = 0;
      let validPresentations = 0;

      formData.presentations.forEach(p => {
        const cost = parseFloat(p.cost);
        const qty = parseFloat(p.unitQuantity);
        if (!isNaN(cost) && !isNaN(qty) && qty > 0) {
          let costPerUnit = cost / qty;

          if (p.measurementUnit === 'kg' && formData.measurementUnit === 'gr') costPerUnit = cost / (qty * 1000);
          if (p.measurementUnit === 'gr' && formData.measurementUnit === 'kg') costPerUnit = cost / (qty / 1000);
          if (p.measurementUnit === 'l' && formData.measurementUnit === 'ml') costPerUnit = cost / (qty * 1000);
          if (p.measurementUnit === 'ml' && formData.measurementUnit === 'l') costPerUnit = cost / (qty / 1000);

          totalCostPerBaseUnit += costPerUnit;
          validPresentations++;
        }
      });

      if (validPresentations > 0) {
        const avgCostPerUnit = totalCostPerBaseUnit / validPresentations;
        const globalPriceQty = parseFloat(formData.globalPriceQuantity) || 1;
        const newGlobalPrice = avgCostPerUnit * globalPriceQty;
        setFormData(prev => ({ ...prev, globalPrice: newGlobalPrice.toFixed(4) }));
      }
    }
  };

  const addPresentation = () => {
    if (!currentPresentation.presentationName || !currentPresentation.cost || !currentPresentation.unitQuantity) return;

    setFormData(prev => ({
      ...prev,
      presentations: [...(prev.presentations || []), { ...currentPresentation }]
    }));

    setCurrentPresentation({
      presentationName: '',
      brand: '',
      cost: '',
      unitQuantity: '1',
      measurementUnit: formData.measurementUnit || 'gr'
    });
  };

  const removePresentation = (index) => {
    setFormData(prev => ({
      ...prev,
      presentations: prev.presentations.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-gray">
                {isEditing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="name">Nombre *</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Ej. Harina de Trigo"
                  className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="globalPrice">Precio Global ($) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      id="globalPrice"
                      type="number"
                      required
                      step="0.0001"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                      value={formData.globalPrice}
                      onChange={(e) => {
                        setFormData({ ...formData, globalPrice: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="globalPriceQuantity">Por cada *</label>
                  <input
                    id="globalPriceQuantity"
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="1000"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                    value={formData.globalPriceQuantity}
                    onChange={(e) => {
                      setFormData({ ...formData, globalPriceQuantity: e.target.value });
                    }}
                  />
                </div>
                <div className="w-28">
                  <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="measurementUnit">Unidad *</label>
                  <select
                    id="measurementUnit"
                    required
                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all bg-white"
                    value={formData.measurementUnit}
                    onChange={(e) => setFormData({ ...formData, measurementUnit: e.target.value })}
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <button
                     type="button"
                     onClick={calculateAveragePrice}
                     className="px-4 py-3 bg-gray-100 text-slate-gray rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm"
                     title="Calcular Precio Promedio de las Presentaciones"
                   >
                     Calcular
                   </button>
                </div>
              </div>

              {/* Presentations Section */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-slate-gray mb-3">Presentaciones de Compra</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 mb-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre Presentación</label>
                      <input type="text" placeholder="Ej. Paquete 1Kg" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-peach-soft" value={currentPresentation.presentationName} onChange={e => setCurrentPresentation({...currentPresentation, presentationName: e.target.value})} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marca (Opc.)</label>
                      <input type="text" placeholder="Ej. Robin Hood" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-peach-soft" value={currentPresentation.brand} onChange={e => setCurrentPresentation({...currentPresentation, brand: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="w-1/4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Costo ($)</label>
                      <input type="number" step="0.01" placeholder="0.00" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-peach-soft" value={currentPresentation.cost} onChange={e => setCurrentPresentation({...currentPresentation, cost: e.target.value})} />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cant.</label>
                      <input type="number" step="0.01" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-peach-soft" value={currentPresentation.unitQuantity} onChange={e => setCurrentPresentation({...currentPresentation, unitQuantity: e.target.value})} />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
                      <select className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-peach-soft bg-white" value={currentPresentation.measurementUnit} onChange={e => setCurrentPresentation({...currentPresentation, measurementUnit: e.target.value})}>
                        {UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                    <div className="w-1/4">
                      <button type="button" onClick={addPresentation} className="w-full py-2 bg-slate-gray text-white text-sm font-medium rounded-lg hover:bg-opacity-90">Add</button>
                    </div>
                  </div>
                </div>

                {formData.presentations.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {formData.presentations.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-slate-gray">{p.presentationName} <span className="text-xs text-gray-400 font-normal">{p.brand && `(${p.brand})`}</span></div>
                          <div className="text-xs text-gray-500 mt-0.5">${p.cost} / ${p.unitQuantity}${p.measurementUnit}</div>
                        </div>
                        <button type="button" onClick={() => removePresentation(idx)} className="text-red-400 hover:text-red-600 p-1">X</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-gray text-white rounded-lg hover:bg-opacity-90 font-medium shadow-sm transition-colors"
                >
                  {isEditing ? 'Guardar Cambios' : 'Agregar Ingrediente'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
