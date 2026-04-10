import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Setup mock modules
jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => next()
}));

const compareMock = jest.fn();
const hashMock = jest.fn();
const signMock = jest.fn();
const verifyMock = jest.fn();

jest.unstable_mockModule('bcryptjs', () => ({
  default: { compare: compareMock, hash: hashMock }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: signMock, verify: verifyMock }
}));

// Mock express-rate-limit to use a very short window for testing if necessary, or just not skip
// Since we used process.env.NODE_ENV, let's just make sure we are not skipping it
jest.unstable_mockModule('express-rate-limit', () => ({
  default: jest.fn().mockImplementation((opts) => {
    // Return a basic middleware that implements the logic
    let hits = {};
    return (req, res, next) => {
      const ip = req.ip || req.headers['x-forwarded-for'];
      hits[ip] = (hits[ip] || 0) + 1;
      if (hits[ip] > opts.max) {
        return res.status(429).json(opts.message);
      }
      next();
    };
  })
}));

// Load routes after mocking
const { default: authRoutes } = await import('../src/routes/authRoutes.js');

const app = express();
app.use(express.json());
// trust proxy setting 1 is better for rate limiting to avoid the warning while still allowing specific IPs
app.set('trust proxy', 1);
app.use('/api/auth', authRoutes);

describe('Auth Rate Limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 429 after 10 requests to /login', async () => {
    // Send 10 requests
    for (let i = 0; i < 10; i++) {
      const res = await request(app).post('/api/auth/login').set('X-Forwarded-For', '192.168.0.1').send();
      expect(res.statusCode).not.toBe(429);
    }

    // The 11th request should be rate limited
    const limitedRes = await request(app).post('/api/auth/login').set('X-Forwarded-For', '192.168.0.1').send();
    expect(limitedRes.statusCode).toBe(429);
    expect(limitedRes.body.error).toBe('Demasiados intentos, por favor inténtalo de nuevo después de 15 minutos');
  });

  it('should return 429 after 10 requests to /register', async () => {
    // Send 10 requests with a different IP
    for (let i = 0; i < 10; i++) {
      const res = await request(app).post('/api/auth/register').set('X-Forwarded-For', '192.168.0.2').send();
      expect(res.statusCode).not.toBe(429);
    }

    const limitedRes = await request(app).post('/api/auth/register').set('X-Forwarded-For', '192.168.0.2').send();
    expect(limitedRes.statusCode).toBe(429);
    expect(limitedRes.body.error).toBe('Demasiados intentos, por favor inténtalo de nuevo después de 15 minutos');
  });
});
