/* global describe, it, expect, jest, beforeEach */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BudgetManager from '../BudgetManager';
import { budgetApi } from '../../../api';
import toast from 'react-hot-toast';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../../api', () => ({
  budgetApi: {
    getAll: jest.fn(),
    delete: jest.fn(),
  },
  superRecipeApi: {
    getAll: jest.fn(),
  }
}));

jest.mock('react-hot-toast');
jest.mock('../BudgetList', () => ({ budgets, onCreateNew, onEdit, onDelete }) => (
  <div data-testid="budget-list">
    <button onClick={onCreateNew}>Create New</button>
    {budgets.map(b => (
      <div key={b.id}>
        <span>{b.customerName}</span>
        <button onClick={() => onEdit(b)}>Edit</button>
        <button onClick={() => onDelete(b.id)}>Delete</button>
      </div>
    ))}
  </div>
));
jest.mock('../BudgetBuilderWrapper', () => ({ onSuccess }) => (
  <div data-testid="budget-builder">
    <button onClick={onSuccess}>Success</button>
  </div>
));

describe('BudgetManager', () => {
  const mockBudgets = [
    { id: '1', customerName: 'Client A' },
    { id: '2', customerName: 'Client B' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    budgetApi.getAll.mockResolvedValue(mockBudgets);
  });

  it('renders list view initially and fetches budgets', async () => {
    render(<BudgetManager />);
    expect(screen.getByTestId('budget-list')).toBeInTheDocument();
    await waitFor(() => {
      expect(budgetApi.getAll).toHaveBeenCalled();
    });
    await waitFor(() => expect(screen.getByText('Client A')).toBeInTheDocument());
  });

  it('switches to builder view on create new', async () => {
    render(<BudgetManager />);
    await waitFor(() => expect(screen.getByText('Client A')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create New'));
    expect(screen.getByTestId('budget-builder')).toBeInTheDocument();
  });

  it('switches to builder view on edit', async () => {
    render(<BudgetManager />);
    await waitFor(() => expect(screen.getByText('Client A')).toBeInTheDocument());
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    expect(screen.getByTestId('budget-builder')).toBeInTheDocument();
  });

  it('handles delete correctly', async () => {
    budgetApi.delete.mockResolvedValue({});
    render(<BudgetManager />);
    await waitFor(() => expect(screen.getByText('Client A')).toBeInTheDocument());

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(budgetApi.delete).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Presupuesto eliminado exitosamente');
      expect(budgetApi.getAll).toHaveBeenCalledTimes(2); // Initial fetch + fetch after delete
    });
  });

  it('switches back to list on success from builder', async () => {
    render(<BudgetManager />);
    await waitFor(() => expect(screen.getByText('Client A')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Create New'));
    expect(screen.getByTestId('budget-builder')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Success'));
    expect(screen.getByTestId('budget-list')).toBeInTheDocument();
  });
});
