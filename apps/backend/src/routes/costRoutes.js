import express from 'express';
import { calculateSuperRecipeCost } from '../controllers/costController.js';

const router = express.Router();

router.get('/calculate-cost/:superRecipeId', calculateSuperRecipeCost);

export default router;
