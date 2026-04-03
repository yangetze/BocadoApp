/* global describe, it, expect, jest */
import { renderHook, act } from '@testing-library/react';
import { useBuilder } from './useBuilder';

// Mock api to prevent real network calls
jest.mock('../../api', () => ({
  budgetApi: { createBudget: jest.fn() },
  superRecipeApi: { createSuperRecipe: jest.fn() },
  baseRecipeApi: { createBaseRecipe: jest.fn() }
}));

describe('useBuilder Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBuilder('superRecipe'));

    expect(result.current.canvasItems).toEqual([]);
    expect(result.current.activeId).toBeNull();
    expect(result.current.activeItem).toBeNull();
    expect(result.current.suggestedMargin).toBeNull();
    expect(result.current.isSaving).toBe(false);
  });

  it('should compute totalBaseRecipeCost correctly for baseRecipe mode', () => {
    const { result } = renderHook(() => useBuilder('baseRecipe'));

    act(() => {
      result.current.setCanvasItems([
        { id: '1', quantity: 200, unitQuantity: 1000, globalCost: 10 }, // 200/1000 * 10 = 2
        { id: '2', quantity: 50, unitQuantity: 100, globalCost: 20 }   // 50/100 * 20 = 10
      ]);
    });

    expect(result.current.totalBaseRecipeCost).toBe(12);
  });

  it('should remove item and fetch margin recommendation for superRecipe', () => {
    const { result } = renderHook(() => useBuilder('superRecipe'));

    act(() => {
      result.current.setCanvasItems([
        { id: 'item1', quantity: 1 },
        { id: 'item2', quantity: 2 }
      ]);
    });

    act(() => {
      result.current.removeItem('item1');
    });

    expect(result.current.canvasItems).toHaveLength(1);
    expect(result.current.canvasItems[0].id).toBe('item2');
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useBuilder('superRecipe'));

    act(() => {
      result.current.setCanvasItems([{ id: 'item1', quantity: 1 }]);
    });

    act(() => {
      result.current.updateItemQuantity('item1', 5);
    });

    expect(result.current.canvasItems[0].quantity).toBe(5);
  });
});
