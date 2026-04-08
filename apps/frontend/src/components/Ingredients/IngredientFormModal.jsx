import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UNITS = ['gr', 'kg', 'ml', 'l', 'u'];

export default function IngredientFormModal({ isOpen, onClose, onSave, initialData }) {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    globalCost: '',
    unitQuantity: '1',
    measurementUnit: 'gr'
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({ name: '', brand: '', globalCost: '', unitQuantity: '1', measurementUnit: 'gr' });
      }
    }
  }, [isOpen, initialData]);

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
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-gray">
                {isEditing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="brand">Marca (Opcional)</label>
                <input
                  id="brand"
                  type="text"
                  placeholder="Ej. Robin Hood"
                  className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="globalCost">Costo Global (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    id="globalCost"
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                    value={formData.globalCost}
                    onChange={(e) => setFormData({ ...formData, globalCost: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="unitQuantity">Cantidad *</label>
                  <input
                    id="unitQuantity"
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="Ej. 1"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                    value={formData.unitQuantity}
                    onChange={(e) => setFormData({ ...formData, unitQuantity: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-gray mb-1" htmlFor="measurementUnit">Unidad *</label>
                  <select
                    id="measurementUnit"
                    required
                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all bg-white"
                    value={formData.measurementUnit}
                    onChange={(e) => setFormData({ ...formData, measurementUnit: e.target.value })}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
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
