import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/auth.js';

/**
 * Middleware para verificar si el usuario tiene un JWT válido.
 * Extrae el usuario y lo inyecta en la petición para uso posterior.
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <TOKEN>

    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado: No se proporcionó un token de autenticación' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // En Supabase el ID puede estar en decoded.sub o decoded.id.
    // Verificamos si el usuario está activo (si esa info viene en el token o se valida luego)
    if (decoded.active === false) {
      return res.status(403).json({ error: 'Usuario inactivo.' });
    }

    req.user = decoded; // Inyecta los datos del usuario (id, username, role)
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Tu sesión ha expirado, por favor inicia sesión de nuevo' });
    }
    res.status(403).json({ error: 'Token no válido o malformado' });
  }
};

// Aliases por compatibilidad
export const authenticateToken = verifyToken;

/**
 * Middleware para restringir acceso solo a Administradores
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'No tienes los permisos suficientes (ADMIN) para realizar esta acción' });
  }
};

export const isAdmin = requireAdmin;
