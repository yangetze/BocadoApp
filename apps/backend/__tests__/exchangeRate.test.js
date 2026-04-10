import request from 'supertest'
import express from 'express'
import { jest } from '@jest/globals'
import prisma from '../src/prisma.js'

jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'user-default-1' }
    next()
  }
}))

const { default: exchangeRateRoutes } = await import('../src/routes/exchangeRateRoutes.js')

const app = express()
app.use(express.json())
app.use('/api/exchange-rates', exchangeRateRoutes)

describe('Exchange Rate API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/exchange-rates', () => {
    it('should return a list of exchange rates', async () => {
      process.env.TEST_MODE = 'false'
      const mockRates = [
        { id: '1', rate: 36.5, targetCurrencyId: 'ves-id', targetCurrency: { code: 'VES' } }
      ]

      prisma.exchangeRate.count.mockResolvedValue(1)
      prisma.exchangeRate.findMany.mockResolvedValue(mockRates)

      const response = await request(app).get('/api/exchange-rates')

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual(mockRates)
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(1)
      expect(prisma.exchangeRate.findMany).toHaveBeenCalledTimes(1)
    })

    it('should handle internal server error', async () => {
      process.env.TEST_MODE = 'false'
      prisma.exchangeRate.count.mockRejectedValue(new Error('DB Error'))
      prisma.exchangeRate.findMany.mockRejectedValue(new Error('DB Error'))

      const response = await request(app).get('/api/exchange-rates')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'Internal server error' })
    })
  })

  describe('POST /api/exchange-rates/manual', () => {
    it('should require targetCurrencyId and rate', async () => {
      const response = await request(app).post('/api/exchange-rates/manual').send({
        rate: 36.5
      })
      expect(response.status).toBe(400)
    })

    it('should create or update a manual rate', async () => {
      prisma.currency.findUnique.mockResolvedValue({ id: 'ves-id', code: 'VES' })
      process.env.TEST_MODE = 'false'
      const mockRate = { id: 'rate-1', rate: 36.5 }
      prisma.exchangeRate.upsert.mockResolvedValue(mockRate)

      const response = await request(app)
        .post('/api/exchange-rates/manual')
        .send({ targetCurrencyId: 'ves-id', rate: 36.5 })

      expect(response.status).toBe(200)
      expect(response.body.rate).toEqual(mockRate.rate)
      expect(prisma.exchangeRate.upsert).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET /api/exchange-rates/currencies', () => {
    it('should return currencies ensuring defaults exist', async () => {
      prisma.currency.findUnique.mockResolvedValue({ code: 'USD' })
      prisma.currency.findMany.mockResolvedValue([{ code: 'USD' }, { code: 'VES' }])

      const response = await request(app).get('/api/exchange-rates/currencies')
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
    })
  })
})
