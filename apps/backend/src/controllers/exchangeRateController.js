import prisma from '../prisma.js';

// Carga Manual: Recibe targetCurrencyId, rate, y optionally effectiveDate
export const createOrUpdateManualRate = async (req, res) => {
  try {
    const { targetCurrencyId, rate, effectiveDate } = req.body;

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

    // Use Prisma's upsert to automatically create or update based on the unique constraint
    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        effectiveDate_targetCurrencyId: {
          effectiveDate: normalizedDate,
          targetCurrencyId: targetCurrencyId,
        }
      },
      update: {
        rate: parseFloat(rate),
        source: 'MANUAL',
      },
      create: {
        targetCurrencyId: targetCurrencyId,
        rate: parseFloat(rate),
        effectiveDate: normalizedDate,
        source: 'MANUAL',
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
    const sourceEnum = type === 'paralelo' ? 'CRIPTOYA_PARALELO' : 'CRIPTOYA_BCV';

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

    // 3. Upsert the rate
    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        effectiveDate_targetCurrencyId: {
          effectiveDate: normalizedDate,
          targetCurrencyId: targetCurrency.id,
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
    console.error('Error in getExchangeRates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrencies = async (req, res) => {
    try {
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