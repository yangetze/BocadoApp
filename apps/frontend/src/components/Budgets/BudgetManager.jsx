import React, { useState, useEffect } from 'react';
import { budgetApi } from '../../api';
import toast from 'react-hot-toast';
import BudgetList from './BudgetList';
import BudgetBuilderWrapper from './BudgetBuilderWrapper';
import { ArrowLeft } from 'lucide-react';

export default function BudgetManager() {
  const [view, setView] = useState('list'); // 'list' or 'builder'
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetApi.getAll();
      setBudgets(data);
    } catch (error) {
      toast.error('Error al cargar los presupuestos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchBudgets();
    }
  }, [view]);

  const handleDelete = async (id) => {
    try {
      await budgetApi.delete(id);
      toast.success('Presupuesto eliminado exitosamente');
      fetchBudgets();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el presupuesto');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setView('builder');
  };

  const handleCreateNew = () => {
    setEditingBudget(null);
    setView('builder');
  };

  if (view === 'builder') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-slate-gray hover:text-peach-soft transition-colors font-medium mb-4"
          aria-label="Volver a la lista de presupuestos"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </button>
        <BudgetBuilderWrapper
          initialData={editingBudget}
          onSuccess={() => {
             setView('list');
             setEditingBudget(null);
          }}
        />
      </div>
    );
  }

  return (
    <BudgetList
      budgets={budgets}
      loading={loading}
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
