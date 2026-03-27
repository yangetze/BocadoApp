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
