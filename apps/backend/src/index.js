import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import costRoutes from './routes/costRoutes.js';
import exchangeRateRoutes from './routes/exchangeRateRoutes.js';
import marginRoutes from './routes/marginRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import baseRecipeRoutes from './routes/baseRecipeRoutes.js';
import superRecipeRoutes from './routes/superRecipeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { setupCronJobs } from './cronJobs.js';
import { isTestMode } from './mockData.js';

import prismaClient from './prisma.js';
const prisma = prismaClient.default || prismaClient;

// Ensure default currencies exist
async function initCurrencies() {
  if (isTestMode()) return;
  try {
    let baseCurrency = await prisma.currency.findUnique({ where: { code: 'USD' } });
    if(!baseCurrency) {
         await prisma.currency.create({
            data: { code: 'USD', symbol: '$', isBase: true }
          });
         console.log('Created default USD currency');
    }

    let vesCurrency = await prisma.currency.findUnique({ where: { code: 'VES' } });
    if (!vesCurrency) {
      await prisma.currency.create({
        data: { code: 'VES', symbol: 'Bs', isBase: false }
      });
      console.log('Created default VES currency');
    }
  } catch (err) {
    console.error('Error initializing default currencies:', err);
  }
}


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', costRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);
app.use('/api/margins', marginRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/base-recipes', baseRecipeRoutes);
app.use('/api/super-recipes', superRecipeRoutes);

// Setup Cron Jobs (only if not in test mode, or handle gracefully)
if (!isTestMode()) {
  setupCronJobs();
} else {
  console.log('Test Mode is ON - Cron jobs disabled');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'BocadoApp Backend Running',
    testMode: isTestMode()
  });
});

app.listen(port, async () => {
  await initCurrencies();
  console.log(`Server running on port ${port}`);
});
