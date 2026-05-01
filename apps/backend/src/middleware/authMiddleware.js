import jwt from 'jsonwebtoken';

import prismaClient from '../prisma.js';
import { JWT_SECRET } from '../config/auth.js';
import logger from '../utils/logger.js';

const prisma = prismaClient.default || prismaClient;

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
    
    // Check if it's deactivated in the token payload early
    if (decoded.active === false) {
      return res.status(403).json({ error: 'Usuario inactivo.' });
    }

    // Security: Query the database to ensure the user still exists and hasn't been deactivated
    // after the token was issued.
    // Notice: mockData is NOT used here to prevent test mode leakage in production middleware.
    // Prisma should be mocked instead in the test files.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true, active: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Acceso denegado: Usuario no encontrado' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Usuario inactivo.' });
    }

    req.user = user;
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
