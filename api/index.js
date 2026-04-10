import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from '../apps/backend/src/utils/logger.js';
import costRoutes from '../apps/backend/src/routes/costRoutes.js';
import exchangeRateRoutes from '../apps/backend/src/routes/exchangeRateRoutes.js';
import marginRoutes from '../apps/backend/src/routes/marginRoutes.js';
import budgetRoutes from '../apps/backend/src/routes/budgetRoutes.js';
import ingredientRoutes from '../apps/backend/src/routes/ingredientRoutes.js';
import baseRecipeRoutes from '../apps/backend/src/routes/baseRecipeRoutes.js';
import superRecipeRoutes from '../apps/backend/src/routes/superRecipeRoutes.js';
import authRoutes from '../apps/backend/src/routes/authRoutes.js';
import userRoutes from '../apps/backend/src/routes/userRoutes.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'BocadoApp Backend Running on Vercel Serverless',
  });
});

export default app;
