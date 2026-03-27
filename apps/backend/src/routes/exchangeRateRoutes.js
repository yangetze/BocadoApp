import express from 'express';
import {
  createOrUpdateManualRate,
  fetchAndStoreApiRate,
  getExchangeRates,
  getCurrencies
} from '../controllers/exchangeRateController.js';

const router = express.Router();

router.get('/', getExchangeRates);
router.post('/manual', createOrUpdateManualRate);
router.post('/sync-api', fetchAndStoreApiRate);
router.get('/currencies', getCurrencies);

export default router;