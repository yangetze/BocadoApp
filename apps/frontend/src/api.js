const API_URL = 'http://localhost:3000/api';

export const exchangeRateApi = {
  getRates: async () => {
    const res = await fetch(`${API_URL}/exchange-rates`);
    if (!res.ok) throw new Error('Error al obtener las tasas de cambio');
    return res.json();
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
    const res = await fetch(`${API_URL}/exchange-rates/currencies`);
    if (!res.ok) throw new Error('Error al obtener las monedas');
    return res.json();
  }
};

export const ingredientApi = {
  getIngredients: async () => {
    const res = await fetch(`${API_URL}/ingredients`);
    if (!res.ok) throw new Error('Error al obtener los ingredientes');
    return res.json();
  },
  createIngredient: async (data) => {
    const res = await fetch(`${API_URL}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear el ingrediente');
    return res.json();
  },
  updateIngredient: async (id, data) => {
    const res = await fetch(`${API_URL}/ingredients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar el ingrediente');
    return res.json();
  },
  deleteIngredient: async (id) => {
    const res = await fetch(`${API_URL}/ingredients/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Error al eliminar el ingrediente');
    }
    return res.json();
  }
};

export const baseRecipeApi = {
  getBaseRecipes: async () => {
    const res = await fetch(`${API_URL}/base-recipes`);
    if (!res.ok) throw new Error('Error al obtener las recetas base');
    return res.json();
  },
  createBaseRecipe: async (data) => {
    const res = await fetch(`${API_URL}/base-recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear la receta base');
    return res.json();
  },
  updateBaseRecipe: async (id, data) => {
    const res = await fetch(`${API_URL}/base-recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar la receta base');
    return res.json();
  },
  deleteBaseRecipe: async (id) => {
    const res = await fetch(`${API_URL}/base-recipes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Error al eliminar la receta base');
    }
    return res.json();
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
