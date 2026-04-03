import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ingredientApi } from '../../api';

const UNITS = ['gr', 'kg', 'ml', 'l', 'u'];

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State for the new inline item
  const [newItem, setNewItem] = useState({ name: '', brand: '', globalCost: '', unitQuantity: '1', measurementUnit: 'gr' });

  // State for editing existing item
  const [editItem, setEditItem] = useState({});

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientApi.getAll(searchQuery);
      setIngredients(data);
    } catch {
      toast.error('Error al cargar los ingredientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchIngredients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAdd = async () => {
    if (!newItem.name || !newItem.globalCost || !newItem.measurementUnit || !newItem.unitQuantity) {
      toast.error('Nombre, costo, cantidad y unidad son obligatorios');
      return;
    }
    try {
      const added = await ingredientApi.create(newItem);
      setIngredients([added, ...ingredients]);
      setNewItem({ name: '', brand: '', globalCost: '', unitQuantity: '1', measurementUnit: 'gr' });
      toast.success('Ingrediente agregado');
    } catch {
      toast.error('Error al agregar el ingrediente');
    }
  };

  const handleEditStart = (ingredient) => {
    setEditingId(ingredient.id);
    setEditItem({ ...ingredient });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditItem({});
  };

  const handleEditSave = async () => {
    if (!editItem.name || !editItem.globalCost || !editItem.measurementUnit || !editItem.unitQuantity) {
      toast.error('Nombre, costo, cantidad y unidad son obligatorios');
      return;
    }
    try {
      const updated = await ingredientApi.update(editItem.id, editItem);
      setIngredients(ingredients.map(ing => ing.id === updated.id ? updated : ing));
      setEditingId(null);
      toast.success('Ingrediente actualizado');
    } catch {
      toast.error('Error al actualizar el ingrediente');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ingrediente?')) return;
    try {
      await ingredientApi.delete(id);
      setIngredients(ingredients.filter(ing => ing.id !== id));
      toast.success('Ingrediente eliminado');
    } catch {
      toast.error('Error al eliminar el ingrediente');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-gray mb-2">Ingredientes</h1>
        <p className="text-gray-500">Administra tu inventario base de ingredientes y sus costos en USD.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100 text-slate-gray">
              <th className="py-3 px-4 font-semibold">Nombre</th>
              <th className="py-3 px-4 font-semibold">Marca <span className="text-sm text-gray-400 font-normal">(Opcional)</span></th>
              <th className="py-3 px-4 font-semibold">Costo (USD)</th>
              <th className="py-3 px-4 font-semibold">Cantidad</th>
              <th className="py-3 px-4 font-semibold">Unidad</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* INLINE ADD ROW */}
            <tr className="border-b border-gray-50 bg-peach-soft/5">
              <td className="py-3 px-4">
                <input
                  type="text"
                  placeholder="Ej. Harina de Trigo"
                  className="w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  placeholder="Ej. Robin Hood"
                  className="w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                />
              </td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-7 pr-2 py-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                    value={newItem.globalCost}
                    onChange={(e) => setNewItem({ ...newItem, globalCost: e.target.value })}
                  />
                </div>
              </td>
              <td className="py-3 px-4">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej. 900"
                  className="w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                  value={newItem.unitQuantity}
                  onChange={(e) => setNewItem({ ...newItem, unitQuantity: e.target.value })}
                />
              </td>
              <td className="py-3 px-4">
                <select
                  className="w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all bg-white"
                  value={newItem.measurementUnit}
                  onChange={(e) => setNewItem({ ...newItem, measurementUnit: e.target.value })}
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={handleAdd}
                  className="bg-slate-gray text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all font-medium text-sm shadow-sm shadow-slate-gray/20 whitespace-nowrap"
                >
                  + Agregar
                </button>
              </td>
            </tr>

            {/* DATA ROWS */}
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
                    <p className="text-sm text-gray-500">Agrega el primero en la fila superior</p>
                  </div>
                </td>
              </tr>
            ) : (
              ingredients.map((ing) => (
                <tr key={ing.id} className={`border-b border-gray-50 transition-colors ${editingId === ing.id ? 'bg-blue-50/30' : 'hover:bg-[#F7C5B2]/10'}`}>
                  {editingId === ing.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                          value={editItem.name}
                          onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                          value={editItem.brand || ''}
                          onChange={(e) => setEditItem({ ...editItem, brand: e.target.value })}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full pl-6 pr-2 py-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                            value={editItem.globalCost}
                            onChange={(e) => setEditItem({ ...editItem, globalCost: e.target.value })}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all"
                          value={editItem.unitQuantity}
                          onChange={(e) => setEditItem({ ...editItem, unitQuantity: e.target.value })}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-peach-soft focus:border-peach-soft outline-none transition-all bg-white"
                          value={editItem.measurementUnit}
                          onChange={(e) => setEditItem({ ...editItem, measurementUnit: e.target.value })}
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        <button onClick={handleEditSave} className="text-green-600 hover:text-green-700 font-medium text-sm px-2 py-1 rounded bg-green-50">Guardar</button>
                        <button onClick={handleEditCancel} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-2 py-1 rounded bg-gray-100">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 font-medium text-slate-gray">{ing.name}</td>
                      <td className="py-4 px-4 text-gray-500">{ing.brand || '-'}</td>
                      <td className="py-4 px-4 text-slate-gray font-medium">${Number(ing.globalCost).toFixed(2)}</td>
                      <td className="py-4 px-4 text-slate-gray">{ing.unitQuantity}</td>
                      <td className="py-4 px-4 text-gray-500">
                         <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">{ing.measurementUnit}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                          <button onClick={() => handleEditStart(ing)} className="text-peach-soft hover:text-opacity-80 font-medium text-sm transition-colors">Editar</button>
                          <span className="text-gray-200">|</span>
                          <button onClick={() => handleDelete(ing.id)} className="text-red-400 hover:text-red-600 font-medium text-sm transition-colors">Eliminar</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
