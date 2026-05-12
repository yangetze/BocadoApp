import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

import { JWT_SECRET } from '../config/auth.js';
import logger from '../utils/logger.js';
import prisma from '../prisma.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado: No se proporcionó un token de autenticación' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const userId = decoded.id || decoded.sub;

    if (!userId) {
       return res.status(401).json({ error: 'Token no válido o malformado: no se encontró ID' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        active: true
      }
    });

    if (!dbUser) {
      return res.status(401).json({ error: 'Usuario no encontrado o sesión inválida' });
    }

    if (!dbUser.active) {
      return res.status(403).json({ error: 'Usuario inactivo.' });
    }

    req.user = dbUser;
    next();
  } catch (error) {
    logger.error('Auth Middleware Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Tu sesión ha expirado, por favor inicia sesión de nuevo' });
    }
    res.status(403).json({ error: 'Token no válido o malformado' });
  }
};

export const authenticateToken = verifyToken;

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'No tienes los permisos suficientes (ADMIN) para realizar esta acción' });
  }
};

export const isAdmin = requireAdmin;
