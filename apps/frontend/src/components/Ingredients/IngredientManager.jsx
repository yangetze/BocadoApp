import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ingredientApi } from '../../api';
import IngredientFormModal from './IngredientFormModal';
import { motion, AnimatePresence } from 'framer-motion';

const UNITS = ['gr', 'kg', 'ml', 'l', 'u'];

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Mobile expanded item state
  const [expandedId, setExpandedId] = useState(null);

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ingredientApi.getAll(searchQuery);
      setIngredients(data);
    } catch (error) {
      toast.error(error.message || 'Error al cargar los ingredientes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchIngredients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchIngredients]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ingredient) => {
    setEditingItem(ingredient);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (formData) => {
    if (!formData.name || !formData.globalPrice || !formData.globalPriceQuantity || !formData.measurementUnit) {
      toast.error('Nombre, precio global, cantidad y unidad base son obligatorios');
      return;
    }

    try {
      if (editingItem) {
        // Edit mode
        const updated = await ingredientApi.update(editingItem.id, formData);
        setIngredients(ingredients.map(ing => ing.id === updated.id ? updated : ing));
        toast.success('Ingrediente actualizado');
      } else {
        // Add mode
        const added = await ingredientApi.create(formData);
        setIngredients([added, ...ingredients]);
        toast.success('Ingrediente agregado');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || (editingItem ? 'Error al actualizar el ingrediente' : 'Error al agregar el ingrediente'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ingrediente?')) return;
    try {
      await ingredientApi.delete(id);
      setIngredients(ingredients.filter(ing => ing.id !== id));
      toast.success('Ingrediente eliminado');
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el ingrediente');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)] relative pb-24 md:pb-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-gray mb-1 md:mb-2">Ingredientes</h1>
          <p className="text-sm md:text-base text-gray-500">Administra tu inventario base de ingredientes y sus costos en USD.</p>
        </div>

        {/* Desktop Add Button */}
        <button
          onClick={handleOpenAddModal}
          className="hidden md:block bg-slate-gray text-white px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition-all font-medium text-sm shadow-sm shadow-slate-gray/20 whitespace-nowrap"
        >
          + Nuevo Ingrediente
        </button>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100 text-slate-gray">
              <th className="py-3 px-4 font-semibold">Nombre</th>
              <th className="py-3 px-4 font-semibold">Precio Global (USD)</th>
              <th className="py-3 px-4 font-semibold">Unidad Base</th>
              <th className="py-3 px-4 font-semibold">Presentaciones</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">Cargando ingredientes...</td>
              </tr>
            ) : ingredients.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🥚</div>
                    <p className="text-slate-gray font-medium">Aún no tienes ingredientes</p>
                  </div>
                </td>
              </tr>
            ) : (
              ingredients.map((ing) => (
                <tr key={ing.id} className="border-b border-gray-50 hover:bg-[#F7C5B2]/10 transition-colors group">
                  <td className="py-4 px-4 font-medium text-slate-gray">{ing.name}</td>
                  <td className="py-4 px-4 text-slate-gray font-medium">${Number(ing.globalPrice).toFixed(2)} / {ing.globalPriceQuantity !== 1 ? ing.globalPriceQuantity + " " : ""}{ing.measurementUnit}</td>
                  <td className="py-4 px-4 text-gray-500">
                     <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">{ing.measurementUnit}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-gray text-sm">
                     {ing.presentations?.length || 0} registradas
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(ing)} className="text-peach-soft hover:text-opacity-80 font-medium text-sm transition-colors">Editar</button>
                      <span className="text-gray-200">|</span>
                      <button onClick={() => handleDelete(ing.id)} className="text-red-400 hover:text-red-600 font-medium text-sm transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Cargando ingredientes...</div>
        ) : ingredients.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center opacity-60">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🥚</div>
              <p className="text-slate-gray font-medium">Aún no tienes ingredientes</p>
            </div>
          </div>
        ) : (
          ingredients.map((ing) => (
            <div
              key={ing.id}
              className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <div
                className="p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(ing.id)}
              >
                <div className="flex-1 pr-3">
                  <h3 className="font-medium text-slate-gray text-[15px]">{ing.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{ing.presentations?.length || 0} presentaciones</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-semibold text-slate-gray text-[15px]">${Number(ing.globalPrice).toFixed(2)} / {ing.globalPriceQuantity !== 1 ? ing.globalPriceQuantity + " " : ""}{ing.measurementUnit}</span>
                  <div className={`text-gray-400 transition-transform ${expandedId === ing.id ? 'rotate-180' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === ing.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-50 bg-gray-50/50"
                  >
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Unidad Base:</span>
                        <span className="font-medium text-slate-gray bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                          {ing.measurementUnit}
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 mt-1 border-t border-gray-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(ing); }}
                          className="px-3 py-1.5 text-sm font-medium text-peach-soft bg-peach-soft/10 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(ing.id); }}
                          className="px-3 py-1.5 text-sm font-medium text-red-500 bg-red-50 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* MOBILE FAB (Floating Action Button) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={handleOpenAddModal}
          className="bg-slate-gray text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 active:scale-95 transition-all"
          aria-label="Agregar ingrediente"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <IngredientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem}
      />
    </div>
  );
}
