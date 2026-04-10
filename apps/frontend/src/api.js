const API_URL = import.meta.env.VITE_API_URL || '/api'

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Si API_URL es '/api', esto creará peticiones a '/api/ruta'
  // Si estamos en Vercel, Vercel reenviará '/api/ruta' a nuestra función serverless
  const fullUrl = API_URL.startsWith('http') ? `${API_URL}${url}` : `${API_URL}${url}`

  const res = await fetch(fullUrl, {
    ...options,
    headers
  })

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    const errData = await res.json().catch(() => null)
    throw { response: { data: errData, status: res.status } }
  }

  return { data: await res.json() }
}

export const api = {
  get: (url) => fetchWithAuth(url),
  post: (url, data) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => fetchWithAuth(url, { method: 'DELETE' })
}

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data)
}

export const userApi = {
  getAll: () => api.get('/users'),
  updateStatus: (id, data) => api.put(`/users/${id}`, data)
}

export const exchangeRateApi = {
  getRates: async (params = {}) => {
    try {
      const res = await api.get('/exchange-rates', { params })
      return res.data
    } catch (error) {
      console.error(error)
      throw error.response?.data?.error || 'Error al obtener las tasas de cambio'
    }
  },

  createOrUpdateManualRate: async (data) => {
    try {
      const res = await api.post('/exchange-rates/manual', data)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al crear/actualizar tasa manual')
    }
  },

  syncAutomaticRate: async (type) => {
    try {
      const res = await api.post('/exchange-rates/sync-api', { type })
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al sincronizar tasa')
    }
  },

  getCurrencies: async () => {
    try {
      const res = await api.get('/exchange-rates/currencies')
      return res.data
    } catch (error) {
      console.error(error)
      throw error.response?.data?.error || 'Error al obtener las monedas'
    }
  }
}

export const ingredientApi = {
  getAll: async (search = '') => {
    try {
      const url = search ? `/ingredients?search=${encodeURIComponent(search)}` : '/ingredients'
      const res = await api.get(url)
      return res.data
    } catch (error) {
      console.error(error)
      throw error.response?.data?.error || 'Error al obtener ingredientes'
    }
  },

  create: async (data) => {
    try {
      const res = await api.post('/ingredients', data)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al crear el ingrediente')
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/ingredients/${id}`, data)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar el ingrediente')
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/ingredients/${id}`)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al eliminar el ingrediente')
    }
  }
}

export const baseRecipeApi = {
  getAll: async () => {
    try {
      const res = await api.get('/base-recipes')
      return res.data
    } catch (error) {
      console.error(error)
      throw error.response?.data?.error || 'Error al obtener recetas base'
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/base-recipes/${id}`)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener receta base')
    }
  },

  create: async (data) => {
    try {
      const res = await api.post('/base-recipes', data)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al crear la receta base')
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/base-recipes/${id}`, data)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar la receta base')
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/base-recipes/${id}`)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al eliminar la receta base')
    }
  }
}

export const superRecipeApi = {
  getAll: async () => {
    try {
      const res = await api.get('/super-recipes')
      return res.data
    } catch (error) {
      console.error(error)
      throw error.response?.data?.error || 'Error al obtener súper recetas'
    }
  },

  create: async (data) => {
    try {
      const res = await api.post('/super-recipes', data)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al crear súper receta')
    }
  }
}

export const budgetApi = {
  getAll: async () => {
    try {
      const res = await api.get('/budgets')
      return res.data
    } catch (error) {
      console.error(error)
      throw error.response?.data?.error || 'Error al obtener presupuestos'
    }
  },

  create: async (data) => {
    try {
      const res = await api.post('/budgets', data)
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al crear presupuesto')
    }
  }
}

export default api
