import crypto from 'node:crypto';
// Ensure we use the exact exported module which might be mocked in tests
import prismaClient from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';
import logger from '../utils/logger.js';
const prisma = prismaClient.default || prismaClient;

let defaultCurrenciesVerified = false;

// Performance optimization: cache default currencies check to prevent redundant DB queries on every request
const ensureDefaultCurrencies = async () => {
  if (defaultCurrenciesVerified || isTestMode()) return;

  let baseCurrency = await prisma.currency.findUnique({ where: { code: 'USD' } });
  if (!baseCurrency) {
    await prisma.currency.create({
      data: { code: 'USD', symbol: '$', isBase: true }
    });
  }

  let vesCurrency = await prisma.currency.findUnique({ where: { code: 'VES' } });
  if (!vesCurrency) {
    await prisma.currency.create({
      data: { code: 'VES', symbol: 'Bs', isBase: false }
    });
  }

  defaultCurrenciesVerified = true;
};

// Carga Manual: Recibe targetCurrencyId, rate, y optionally effectiveDate
export const createOrUpdateManualRate = async (req, res) => {
  try {
    const { targetCurrencyId, rate, effectiveDate, source = 'MANUAL' } = req.body;

    if (!targetCurrencyId || !rate) {
      return res.status(400).json({ error: 'targetCurrencyId and rate are required' });
    }

    // Ensure default currencies exist
    await ensureDefaultCurrencies();

    // Default to today (start of day) if no date provided to ensure uniqueness per day
    const dateToUse = effectiveDate ? new Date(effectiveDate) : new Date();
    // Normalize to start of day in UTC for consistency
    const normalizedDate = new Date(Date.UTC(dateToUse.getUTCFullYear(), dateToUse.getUTCMonth(), dateToUse.getUTCDate()));

    if (isTestMode()) {
      const existingRateIndex = mockData.exchangeRates.findIndex(
        r => r.targetCurrencyId === targetCurrencyId &&
             new Date(r.effectiveDate).getTime() === normalizedDate.getTime() &&
             r.source === source
      );

      const targetCurrency = mockData.currencies.find(c => c.id === targetCurrencyId);

      let newOrUpdatedRate;
      if (existingRateIndex >= 0) {
        mockData.exchangeRates[existingRateIndex].rate = parseFloat(rate);
        mockData.exchangeRates[existingRateIndex].source = source;
        newOrUpdatedRate = mockData.exchangeRates[existingRateIndex];
      } else {
        newOrUpdatedRate = {
          id: `er-${crypto.randomUUID()}`,
          rate: parseFloat(rate),
          effectiveDate: normalizedDate,
          source: source,
          targetCurrencyId,
          targetCurrency
        };
        mockData.exchangeRates.push(newOrUpdatedRate);
      }

      return res.status(200).json(newOrUpdatedRate);
    }

    // Use Prisma's upsert to automatically create or update based on the unique constraint
    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        effectiveDate_targetCurrencyId_source: {
          effectiveDate: normalizedDate,
          targetCurrencyId: targetCurrencyId,
          source: source
        }
      },
      update: {
        rate: parseFloat(rate),
        source: source,
      },
      create: {
        targetCurrencyId: targetCurrencyId,
        rate: parseFloat(rate),
        effectiveDate: normalizedDate,
        source: source,
      }
    });

    return res.status(200).json(exchangeRate);
  } catch (error) {
    logger.error('Error in createOrUpdateManualRate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// API (CriptoYa): Consulta la API y actualiza la tasa para VES
export const fetchAndStoreApiRate = async (req, res) => {
  try {
    // Determine which rate type to fetch (bcv or paralelo), default to bcv
    const type = req?.body?.type || 'bcv';
    // Determine the enum to use. Default to CRIPTOYA_BCV (USD BCV) as requested.
    const sourceEnum = type === 'paralelo' ? 'CRIPTOYA_PARALELO' : (type === 'euro' ? 'EURO' : 'CRIPTOYA_BCV');

    // 1. Fetch from DolarAPI Venezuela depending on type
    let apiUrl = 'https://ve.dolarapi.com/v1/dolares';
    if (type === 'euro') {
        apiUrl = 'https://ve.dolarapi.com/v1/euros';
    } else if (type === 'usdt') {
        // Just in case we support it later or they add it, but currently DolarAPI VE mainly has dolares and euros
        // We will default to dolares if usdt is passed, since often it aligns or we can just fetch dolares
        apiUrl = 'https://ve.dolarapi.com/v1/dolares';
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
       throw new Error(`Failed to fetch from DolarAPI: ${response.statusText}`);
    }
    const data = await response.json();

    // Extract the requested rate. For euro, we just take oficial if that's what's mapped, or whatever is there.
    const sourceName = type === 'paralelo' ? 'paralelo' : 'oficial';
    const rateData = data.find(item => item.fuente === sourceName) || data[0]; // fallback to first item if not found

    if (!rateData || !rateData.promedio) {
        throw new Error(`Rate type '${type}' not found in API response`);
    }
    const rate = rateData.promedio;

    // 2. Find the VES Currency ID
    // Assuming 'VES' is the code for Bolivar
    // Ensure default currencies exist (including USD and VES)
    await ensureDefaultCurrencies();

    // 2. Find the VES Currency ID
    // Assuming 'VES' is the code for Bolivar
    let targetCurrency = await prisma.currency.findUnique({
      where: { code: 'VES' }
    });


    // Normalize to today (start of day UTC)
    const today = new Date();
    const normalizedDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if (isTestMode()) {
      const vesCur = mockData.currencies.find(c => c.code === 'VES');
      const targetCurId = vesCur ? vesCur.id : 'cur-2'; // Defaulting from mockData

      const existingRateIndex = mockData.exchangeRates.findIndex(
        r => r.targetCurrencyId === targetCurId &&
             new Date(r.effectiveDate).getTime() === normalizedDate.getTime() &&
             r.source === sourceEnum
      );

      let newOrUpdatedRate;
      if (existingRateIndex >= 0) {
        mockData.exchangeRates[existingRateIndex].rate = parseFloat(rate);
        mockData.exchangeRates[existingRateIndex].source = sourceEnum;
        newOrUpdatedRate = mockData.exchangeRates[existingRateIndex];
      } else {
        newOrUpdatedRate = {
          id: `er-${crypto.randomUUID()}`,
          rate: parseFloat(rate),
          effectiveDate: normalizedDate,
          source: sourceEnum,
          targetCurrencyId: targetCurId,
          targetCurrency: vesCur
        };
        mockData.exchangeRates.push(newOrUpdatedRate);
      }

      if (res) return res.status(200).json(newOrUpdatedRate);
      return newOrUpdatedRate;
    }

    // 3. Upsert the rate
    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        effectiveDate_targetCurrencyId_source: {
          effectiveDate: normalizedDate,
          targetCurrencyId: targetCurrency.id,
          source: sourceEnum
        }
      },
      update: {
        rate: parseFloat(rate),
        source: sourceEnum,
      },
      create: {
        targetCurrencyId: targetCurrency.id,
        rate: parseFloat(rate),
        effectiveDate: normalizedDate,
        source: sourceEnum,
      }
    });

    if (res) {
        return res.status(200).json(exchangeRate);
    } else {
        // Called by cron job
        return exchangeRate;
    }

  } catch (error) {
    logger.error('Error in fetchAndStoreApiRate:', error);
    if (res) {
        return res.status(500).json({ error: 'Internal server error' });
    } else {
        throw error;
    }
  }
};

// GET: Devuelve historial de tasas
export const getExchangeRates = async (req, res) => {
  try {
    const { targetCurrencyId, page = 1, limit = 10, startDate, endDate } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    let effectiveDateFilter = undefined;
    if (startDate || endDate) {
        effectiveDateFilter = {};
        if (startDate) {
            effectiveDateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            effectiveDateFilter.lte = end;
        }
    }

    if (isTestMode()) {
      let result = mockData.exchangeRates;
      if (targetCurrencyId) {
        result = result.filter(r => r.targetCurrencyId === targetCurrencyId);
      }
      if (startDate) {
          result = result.filter(r => new Date(r.effectiveDate) >= new Date(startDate));
      }
      if (endDate) {
          const end = new Date(endDate);
          end.setUTCHours(23, 59, 59, 999);
          result = result.filter(r => new Date(r.effectiveDate) <= end);
      }

      // Sort by effectiveDate desc, then alphabetically by currency code
      result.sort((a, b) => {
          const dateA = new Date(a.effectiveDate).getTime();
          const dateB = new Date(b.effectiveDate).getTime();
          if (dateB !== dateA) return dateB - dateA;

          const codeA = a.targetCurrency?.code || '';
          const codeB = b.targetCurrency?.code || '';
          return codeA.localeCompare(codeB);
      });

      const total = result.length;
      const totalPages = Math.ceil(total / limitNum);
      const data = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({
          data,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
      });
    }

    const whereClause = {};
    if (targetCurrencyId) {
        whereClause.targetCurrencyId = targetCurrencyId;
    }
    if (effectiveDateFilter) {
        whereClause.effectiveDate = effectiveDateFilter;
    }

    const total = await prisma.exchangeRate.count({ where: whereClause });
    const totalPages = Math.ceil(total / limitNum);

    // ⚡ Bolt: Pushed sorting logic down to the database using Prisma's multiple orderBy
    // capabilities instead of an expensive O(n log n) in-memory sort in Node.js.
    let rates = await prisma.exchangeRate.findMany({
      where: whereClause,
      include: {
        targetCurrency: true,
      },
      orderBy: [
        { effectiveDate: 'desc' },
        { targetCurrency: { code: 'asc' } }
      ],
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    });

    return res.status(200).json({
        data: rates,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
    });
  } catch (error) {
    logger.error('Error in getExchangeRates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrencies = async (req, res) => {
    try {
        if (isTestMode()) {
          return res.status(200).json(mockData.currencies);
        }

        // Automatically ensure default currencies exist when querying them to improve UX
        await ensureDefaultCurrencies();

        const currencies = await prisma.currency.findMany();
        return res.status(200).json(currencies);
    } catch (error) {
        logger.error('Error in getCurrencies:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}