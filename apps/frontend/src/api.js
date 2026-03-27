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
