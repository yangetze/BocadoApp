import crypto from 'node:crypto';
// Ensure we use the exact exported module which might be mocked in tests
import prismaClient from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';
const prisma = prismaClient.default || prismaClient;

// Carga Manual: Recibe targetCurrencyId, rate, y optionally effectiveDate
export const createOrUpdateManualRate = async (req, res) => {
  try {
    const { targetCurrencyId, rate, effectiveDate, source = 'MANUAL' } = req.body;

    if (!targetCurrencyId || !rate) {
      return res.status(400).json({ error: 'targetCurrencyId and rate are required' });
    }

    // Ensure default currencies exist
    let baseCurrency = await prisma.currency.findUnique({ where: { code: 'USD' } });
    if(!baseCurrency) {
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
    console.error('Error in createOrUpdateManualRate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// API (CriptoYa): Consulta la API y actualiza la tasa para VES
export const fetchAndStoreApiRate = async (req, res) => {
  try {
    // Determine which rate type to fetch (bcv or paralelo), default to bcv
    const type = req?.body?.type || 'bcv';
    // Using DolarAPI instead of CriptoYa, but keeping the requested enum structure
    const sourceEnum = type === 'paralelo' ? 'PARALLEL' : (type === 'euro' ? 'EURO' : 'OFFICIAL');

    // 1. Fetch from DolarAPI Venezuela
    // https://ve.dolarapi.com/v1/dolares
    const response = await fetch('https://ve.dolarapi.com/v1/dolares');
    if (!response.ok) {
       throw new Error(`Failed to fetch from DolarAPI: ${response.statusText}`);
    }
    const data = await response.json();

    // Extract the requested rate
    const sourceName = type === 'paralelo' ? 'paralelo' : 'oficial';
    const rateData = data.find(item => item.fuente === sourceName);

    if (!rateData || !rateData.promedio) {
        throw new Error(`Rate type '${type}' not found in API response`);
    }
    const rate = rateData.promedio;

    // 2. Find the VES Currency ID
    // Assuming 'VES' is the code for Bolivar
    let targetCurrency = await prisma.currency.findUnique({
      where: { code: 'VES' }
    });

    // If VES doesn't exist, create it for convenience
    if (!targetCurrency) {
      targetCurrency = await prisma.currency.create({
        data: {
          code: 'VES',
          symbol: 'Bs',
          isBase: false
        }
      });
    }

    // Default base currency USD is assumed to exist, if not, create it
    let baseCurrency = await prisma.currency.findUnique({
      where: { code: 'USD' }
    });
    if(!baseCurrency) {
         await prisma.currency.create({
            data: {
              code: 'USD',
              symbol: '$',
              isBase: true
            }
          });
    }

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
    console.error('Error in fetchAndStoreApiRate:', error);
    if (res) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    } else {
        throw error;
    }
  }
};

// GET: Devuelve historial de tasas
export const getExchangeRates = async (req, res) => {
  try {
    const { targetCurrencyId } = req.query;

    if (isTestMode()) {
      let result = mockData.exchangeRates;
      if (targetCurrencyId) {
        result = result.filter(r => r.targetCurrencyId === targetCurrencyId);
      }
      return res.status(200).json(result.sort((a, b) => b.effectiveDate - a.effectiveDate));
    }

    const whereClause = targetCurrencyId ? { targetCurrencyId } : {};

    const rates = await prisma.exchangeRate.findMany({
      where: whereClause,
      include: {
        targetCurrency: true,
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });

    return res.status(200).json(rates);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrencies = async (req, res) => {
    try {
        if (isTestMode()) {
          return res.status(200).json(mockData.currencies);
        }

        // Automatically ensure default currencies exist when querying them to improve UX
        let baseCurrency = await prisma.currency.findUnique({ where: { code: 'USD' } });
        if(!baseCurrency) {
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

        const currencies = await prisma.currency.findMany();
        return res.status(200).json(currencies);
    } catch (error) {
        console.error('Error in getCurrencies:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}