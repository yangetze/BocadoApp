const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const exchangeRateApi = {
  getRates: async () => {
    try {
      const res = await fetch(`${API_URL}/exchange-rates`);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Error al obtener las tasas de cambio');
      }
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createOrUpdateManualRate: async (data) => {
    const res = await fetch(`${API_URL}/exchange-rates/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al guardar la tasa manual');
    return res.json();
  },

  syncApiRate: async (type = 'bcv') => {
    const res = await fetch(`${API_URL}/exchange-rates/sync-api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Error al sincronizar con la API');
    }
    return res.json();
  },

  getCurrencies: async () => {
    // If getting currencies fails initially (e.g., none exist), ensure it doesn't break UI
    try {
      const res = await fetch(`${API_URL}/exchange-rates/currencies`);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Error al obtener las monedas');
      }
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};


let mockIngredients = [
  { id: 'ing-1', name: 'Harina de Trigo', globalCost: 1.5, unitQuantity: 1000, measurementUnit: 'g', brand: 'Robin Hood' },
  { id: 'ing-2', name: 'Azúcar Blanca', globalCost: 1.2, unitQuantity: 1000, measurementUnit: 'g', brand: 'Montalbán' },
  { id: 'ing-3', name: 'Huevos', globalCost: 4.5, unitQuantity: 30, measurementUnit: 'u', brand: 'Granja' },
  { id: 'ing-4', name: 'Mantequilla', globalCost: 6.0, unitQuantity: 500, measurementUnit: 'g', brand: 'Mavesa' }
];

export const ingredientApi = {
  getIngredients: async () => {
    return new Promise((resolve) => setTimeout(() => resolve([...mockIngredients]), 500));
  },
  createIngredient: async (data) => {
    return new Promise((resolve) => {
      const newIng = { id: `ing-${Date.now()}`, ...data };
      mockIngredients = [newIng, ...mockIngredients];
      setTimeout(() => resolve(newIng), 500);
    });
  },
  updateIngredient: async (id, data) => {
    return new Promise((resolve, reject) => {
      const index = mockIngredients.findIndex(i => i.id === id);
      if (index !== -1) {
        mockIngredients[index] = { ...mockIngredients[index], ...data };
        setTimeout(() => resolve(mockIngredients[index]), 500);
      } else {
        setTimeout(() => reject(new Error('Ingrediente no encontrado')), 500);
      }
    });
  },
  deleteIngredient: async (id) => {
    return new Promise((resolve) => {
      mockIngredients = mockIngredients.filter(i => i.id !== id);
      setTimeout(() => resolve({ message: 'Eliminado' }), 500);
    });
  }
};



let mockBaseRecipes = [
  { id: 'br-1', name: 'Bizcocho Vainilla', baseYield: 1000, yieldUnit: 'g', ingredients: [{ ingredient: { name: 'Harina de Trigo', globalCost: 1.5, unitQuantity: 1000, measurementUnit: 'g' }, quantity: 500 }] }
];

export const baseRecipeApi = {
  getBaseRecipes: async () => {
    return new Promise((resolve) => setTimeout(() => resolve([...mockBaseRecipes]), 500));
  },
  createBaseRecipe: async (data) => {
    return new Promise((resolve) => {
      const newBr = { id: `br-${Date.now()}`, ...data, ingredients: data.items?.map(i => ({ ingredient: { id: i.ingredientId, name: 'Ingrediente Mock', globalCost: 1, unitQuantity: 1, measurementUnit: 'g' }, quantity: i.quantity })) || [] };
      mockBaseRecipes = [newBr, ...mockBaseRecipes];
      setTimeout(() => resolve(newBr), 500);
    });
  },
  updateBaseRecipe: async (id, data) => {
    return new Promise((resolve, reject) => {
      const index = mockBaseRecipes.findIndex(i => i.id === id);
      if (index !== -1) {
        mockBaseRecipes[index] = { ...mockBaseRecipes[index], ...data };
        setTimeout(() => resolve(mockBaseRecipes[index]), 500);
      } else {
        setTimeout(() => reject(new Error('Receta base no encontrada')), 500);
      }
    });
  },
  deleteBaseRecipe: async (id) => {
    return new Promise((resolve) => {
      mockBaseRecipes = mockBaseRecipes.filter(i => i.id !== id);
      setTimeout(() => resolve({ message: 'Eliminado' }), 500);
    });
  }
};


export const budgetApi = {
  createBudget: async (data) => {
    const res = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear el presupuesto');
    return res.json();
  },
};

export const superRecipeApi = {
  // En un entorno completo, aquí habría un endpoint para guardar Súper Recetas.
  // Por ahora lo simularemos para el MVP si no existe.
  createSuperRecipe: async (data) => {
    // Si tuvieramos el endpoint real:
    // const res = await fetch(`${API_URL}/super-recipes`, { ... });
    // if (!res.ok) throw new Error('Error al crear la súper receta');
    // return res.json();

    // Simulación de éxito por ahora:
    return new Promise((resolve) => setTimeout(() => resolve({ id: 'new-sr-id', ...data }), 500));
  }
};

export const marginApi = {
  getRecommendation: async (superRecipeId) => {
    const res = await fetch(`${API_URL}/margins/recommend/${superRecipeId}`);
    if (!res.ok) throw new Error('Error al obtener recomendación de margen');
    return res.json();
  }
};
