import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import costRoutes from './routes/costRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', costRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BocadoApp Backend Running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
