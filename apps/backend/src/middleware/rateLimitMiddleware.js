import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { error: 'Demasiados intentos, por favor inténtalo de nuevo después de 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false
})
