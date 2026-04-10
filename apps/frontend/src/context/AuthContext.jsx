import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api' // Custom axios instance or api util

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          // Si hay un token, preguntamos al backend \"¿quién es este pastelero?\"
          const response = await api.get('/auth/me')
          setUser(response.data.user)
          setToken(storedToken)
        } catch (error) {
          console.error('Error al recuperar sesión:', error.message)
          logout() // Si el token falló, borramos rastro
        }
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const login = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    // If using a custom API instance, set the header here
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
