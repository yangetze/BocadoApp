/* global describe, it, expect, jest, beforeEach, beforeAll */
beforeAll(() => {
  window.scrollTo = jest.fn();
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IngredientManager from '../IngredientManager';
import { ingredientApi } from '../../../api';
import toast from 'react-hot-toast';

jest.mock('../../../api', () => ({
  ingredientApi: {
    getAll: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue({})
  }
}));

jest.mock('react-hot-toast', () => {
  const actualToast = jest.requireActual('react-hot-toast');
  const mockToast = {
    ...actualToast,
    success: jest.fn(),
    error: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockToast,
    toast: mockToast,
  };
});

describe('IngredientManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    render(<IngredientManager />);
    expect(screen.getByText('Ingredientes')).toBeInTheDocument();
  });

  it('handles delete error and displays backend message', async () => {
    const mockIngredient = {
      id: 'ing-1',
      name: 'Harina',
      globalPrice: 10,
      globalPriceQuantity: 1000,
      measurementUnit: 'gr',
      presentations: []
    };

    ingredientApi.getAll.mockResolvedValue([mockIngredient]);
    const mockErrorMessage = 'No se puede eliminar el ingrediente porque está en uso en una o más recetas.';
    ingredientApi.delete.mockRejectedValueOnce({ message: mockErrorMessage });

    // Mock confirm
    window.confirm = jest.fn().mockReturnValue(true);

    render(<IngredientManager />);

    // Find and click delete
    const deleteButtons = await screen.findAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]); // Desktop button

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(mockErrorMessage);
    });
  });
});
