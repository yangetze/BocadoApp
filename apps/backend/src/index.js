import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import costRoutes from './routes/costRoutes.js';
import exchangeRateRoutes from './routes/exchangeRateRoutes.js';
import marginRoutes from './routes/marginRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import { setupCronJobs } from './cronJobs.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', costRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);
app.use('/api/margins', marginRoutes);
app.use('/api/budgets', budgetRoutes);

// Setup Cron Jobs
setupCronJobs();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BocadoApp Backend Running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
