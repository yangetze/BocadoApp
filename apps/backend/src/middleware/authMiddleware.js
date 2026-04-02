import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bocado-super-secret-key-2026';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado, token no proporcionado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    
    // En Supabase el ID está en user.sub o user.id según la decodificación
    // Aquí asumimos que nuestro authController lo mete en user.id
    if (user.active === false) return res.status(403).json({ error: 'Usuario inactivo.' });

    req.user = user;
    next();
  });
};

// Mantenemos este alias por compatibilidad si existiese en otras rutas antiguas
export const authenticateToken = verifyToken;

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Se requieren permisos de administrador.' });
  }
};
