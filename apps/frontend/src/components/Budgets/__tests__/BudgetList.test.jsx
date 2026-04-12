import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetList from '../BudgetList';
import '@testing-library/jest-dom';

describe('BudgetList', () => {
  const mockBudgets = [
    { id: '1', customerName: 'Alpha Client', createdAt: new Date('2023-01-01').toISOString() },
    { id: '2', customerName: 'Beta Client', createdAt: new Date('2023-01-02').toISOString() },
    { id: '3', customerName: 'Gamma Client', createdAt: new Date('2023-01-03').toISOString() }
  ];

  it('renders loading state', () => {
    render(<BudgetList loading={true} budgets={[]} onCreateNew={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Cargando presupuestos...')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<BudgetList loading={false} budgets={[]} onCreateNew={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('No se encontraron presupuestos')).toBeInTheDocument();
  });

  it('renders budgets and handles search', () => {
    render(<BudgetList loading={false} budgets={mockBudgets} onCreateNew={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('Alpha Client')).toBeInTheDocument();
    expect(screen.getByText('Beta Client')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Buscar presupuesto por nombre de cliente...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    expect(screen.getByText('Alpha Client')).toBeInTheDocument();
    expect(screen.queryByText('Beta Client')).not.toBeInTheDocument();
  });

  it('calls handlers when buttons are clicked', () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();
    const mockCreate = jest.fn();

    window.confirm = jest.fn(() => true); // mock confirm dialog

    render(<BudgetList loading={false} budgets={mockBudgets} onCreateNew={mockCreate} onEdit={mockEdit} onDelete={mockDelete} />);

    const editButtons = screen.getAllByTitle('Editar Presupuesto');
    fireEvent.click(editButtons[0]);
    expect(mockEdit).toHaveBeenCalledWith(mockBudgets[0]);

    const deleteButtons = screen.getAllByTitle('Eliminar Presupuesto');
    fireEvent.click(deleteButtons[0]);
    expect(mockDelete).toHaveBeenCalledWith('1');
    expect(window.confirm).toHaveBeenCalled();

    const createButton = screen.getByText('Crear Presupuesto');
    fireEvent.click(createButton);
    expect(mockCreate).toHaveBeenCalled();
  });
});
