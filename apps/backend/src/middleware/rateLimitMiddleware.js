import rateLimit from 'express-rate-limit';

const isTestEnvironment = process.env.NODE_ENV === 'test';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { error: 'Demasiados intentos, por favor inténtalo de nuevo después de 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnvironment
});

export const apiSyncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per window for API sync
  message: { error: 'Límite de sincronización alcanzado. Inténtalo de nuevo en una hora.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnvironment
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { error: 'Demasiadas solicitudes de esta IP, por favor inténtalo de nuevo después de 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnvironment
});
