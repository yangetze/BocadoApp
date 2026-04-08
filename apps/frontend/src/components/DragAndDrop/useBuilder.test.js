/* global describe, it, expect, jest */
import { renderHook, act } from '@testing-library/react';
import { useBuilder } from './useBuilder';
import { superRecipeApi } from '../../api';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

jest.mock('../../api', () => ({
  budgetApi: { create: jest.fn() },
  superRecipeApi: { create: jest.fn() },
  baseRecipeApi: { create: jest.fn() },
}));

describe('useBuilder - ingredientTotals', () => {
  it('debería calcular el total de ingredientes para una receta base sumando duplicados', () => {
    const { result } = renderHook(() => useBuilder('baseRecipe'));

    act(() => {
      result.current.setCanvasItems([
        { id: 'ing1', name: 'Harina', quantity: 200, measurementUnit: 'gr' },
        { id: 'ing2', name: 'Azúcar', quantity: 50, measurementUnit: 'gr' },
        { id: 'ing1-dup', ingredientId: 'ing1', name: 'Harina', quantity: 100, measurementUnit: 'gr' }
      ]);
    });

    const totals = result.current.ingredientTotals;
    expect(totals).toHaveLength(2);

    const harina = totals.find(t => t.name === 'Harina');
    expect(harina.totalQuantity).toBe(300);

    const azucar = totals.find(t => t.name === 'Azúcar');
    expect(azucar.totalQuantity).toBe(50);
  });

  it('debería calcular el total de ingredientes para una súper receta en base a proporciones', () => {
    const { result } = renderHook(() => useBuilder('superRecipe'));

    act(() => {
      result.current.setCanvasItems([
        {
          id: 'br1',
          name: 'Bizcocho',
          quantity: 500, // quantityNeeded
          baseYield: 1000,
          ingredients: [
            { ingredientId: 'ing1', quantity: 200, ingredient: { name: 'Harina', measurementUnit: 'gr' } },
            { ingredientId: 'ing2', quantity: 100, ingredient: { name: 'Azúcar', measurementUnit: 'gr' } }
          ]
        },
        {
          id: 'br2',
          name: 'Relleno',
          quantity: 200, // quantityNeeded
          baseYield: 200,
          ingredients: [
            { ingredientId: 'ing2', quantity: 50, ingredient: { name: 'Azúcar', measurementUnit: 'gr' } },
            { ingredientId: 'ing3', quantity: 150, ingredient: { name: 'Crema', measurementUnit: 'ml' } }
          ]
        }
      ]);
    });

    const totals = result.current.ingredientTotals;
    expect(totals).toHaveLength(3);

    const harina = totals.find(t => t.name === 'Harina');
    expect(harina.totalQuantity).toBe(100);

    const azucar = totals.find(t => t.name === 'Azúcar');
    expect(azucar.totalQuantity).toBe(100);

    const crema = totals.find(t => t.name === 'Crema');
    expect(crema.totalQuantity).toBe(150);
  });
});

describe('useBuilder - handleSave', () => {
  it('debería formatear correctamente el payload de superRecipe con quantityNeeded', async () => {
    const { result } = renderHook(() => useBuilder('superRecipe'));

    act(() => {
      result.current.setCanvasItems([
        { id: 'canvas-12345-br1', quantity: 500 }
      ]);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(superRecipeApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(String),
        baseRecipes: [
          { baseRecipeId: 'br1', quantityNeeded: 500 }
        ]
      })
    );
  });
});
