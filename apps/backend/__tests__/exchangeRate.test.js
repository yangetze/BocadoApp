import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'user-default-1' };
    next();
  }
}));

const { default: exchangeRateRoutes } = await import('../src/routes/exchangeRateRoutes.js');
import prisma from '../src/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/exchange-rates', exchangeRateRoutes);


describe('Exchange Rate API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/exchange-rates', () => {
    it('should return a list of exchange rates', async () => {
      const mockRates = [
        { id: '1', rate: 36.5, targetCurrencyId: 'ves-id', targetCurrency: { code: 'VES' } }
      ];
      prisma.exchangeRate.findMany.mockResolvedValue(mockRates);

      const response = await request(app).get('/api/exchange-rates');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRates);
      expect(prisma.exchangeRate.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle internal server error', async () => {
      prisma.exchangeRate.findMany.mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/api/exchange-rates');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /api/exchange-rates/manual', () => {
    it('should require targetCurrencyId and rate', async () => {
      const response = await request(app).post('/api/exchange-rates/manual').send({
        rate: 36.5
      });
      expect(response.status).toBe(400);
    });

    it('should create or update a manual rate', async () => {
      prisma.currency.findUnique.mockResolvedValue({ id: 'ves-id', code: 'VES' });
      const mockRate = { id: 'rate-1', rate: 36.5 };
      prisma.exchangeRate.upsert.mockResolvedValue(mockRate);

      const response = await request(app)
        .post('/api/exchange-rates/manual')
        .send({ targetCurrencyId: 'ves-id', rate: 36.5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRate);
      expect(prisma.exchangeRate.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/exchange-rates/currencies', () => {
    it('should return currencies ensuring defaults exist', async () => {
       prisma.currency.findUnique.mockResolvedValue({ code: 'USD' });
       prisma.currency.findMany.mockResolvedValue([{ code: 'USD' }, { code: 'VES' }]);

       const response = await request(app).get('/api/exchange-rates/currencies');
       expect(response.status).toBe(200);
       expect(response.body.length).toBe(2);
    });
  });
});
