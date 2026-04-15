import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BudgetList({ budgets, loading, onCreateNew, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBudgets = useMemo(() => {
    const term = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return budgets.filter((budget) => {
      const nameMatch = budget.customerName && budget.customerName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term);
      return nameMatch;
    });
  }, [budgets, searchTerm]);

  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage) || 1;
  const paginatedBudgets = filteredBudgets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-gray">Presupuestos</h1>
          <p className="text-gray-500 mt-1">Gestiona tus presupuestos y cotizaciones</p>
        </div>
        <button
          onClick={onCreateNew}
          className="hidden md:flex items-center justify-center gap-2 bg-slate-gray text-white px-5 py-2.5 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Crear Presupuesto
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar presupuesto por nombre de cliente..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-gray placeholder-gray-400 outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando presupuestos...</div>
        ) : paginatedBudgets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-peach-soft/20 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-peach-soft" />
            </div>
            <h3 className="text-xl font-bold text-slate-gray mb-2">No se encontraron presupuestos</h3>
            <p className="text-gray-500">Intenta con otra búsqueda o crea uno nuevo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Cliente / Nombre</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Fecha</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBudgets.map((budget) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={budget.id}
                    className="border-b border-gray-50 hover:bg-peach-soft/10 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-gray">{budget.customerName || 'Sin Nombre'}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(budget.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(budget)}
                          className="p-2 text-slate-gray hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar Presupuesto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) {
                              onDelete(budget.id);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar Presupuesto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredBudgets.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredBudgets.length)} de {filteredBudgets.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onCreateNew}
          className="bg-slate-gray text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 active:scale-95 transition-all"
          aria-label="Crear Presupuesto"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
