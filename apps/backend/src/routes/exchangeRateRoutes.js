import express from 'express'
import {
  createOrUpdateManualRate,
  fetchAndStoreApiRate,
  getExchangeRates,
  getCurrencies
} from '../controllers/exchangeRateController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Todas las rutas de tasas de cambio requieren autenticación
router.use(verifyToken)

router.get('/', getExchangeRates)
router.post('/manual', createOrUpdateManualRate)
router.post('/sync-api', fetchAndStoreApiRate)
router.get('/currencies', getCurrencies)

export default router
