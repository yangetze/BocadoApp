import express from 'express';
import { calculateSuperRecipeCost } from '../controllers/costController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Proteger ruta de cálculo de costos
router.use(verifyToken);

router.get('/calculate-cost/:superRecipeId', calculateSuperRecipeCost);

export default router;
