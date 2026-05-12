import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/auth.js';
import logger from '../utils/logger.js';
import prisma from '../prisma.js';

/**
 * Middleware para verificar si el usuario tiene un JWT válido.
 * Extrae el usuario y lo inyecta en la petición para uso posterior.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <TOKEN>

    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado: No se proporcionó un token de autenticación' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Security: Validate against database to ensure user still exists and is active
    // relying only on token contents leaves the app vulnerable to deactivated users with valid tokens
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Usuario inactivo.' });
    }

    // Security: Inject the fresh user data from the database to ensure role changes
    // (e.g., demotion from ADMIN to USER) are effective immediately and prevent privilege escalation.
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      active: user.active
    };
    next();
  } catch (error) {
    logger.error('Auth Middleware Error:', error.message);
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
