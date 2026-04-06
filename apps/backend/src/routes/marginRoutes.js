import express from 'express';
import { recommendMargin } from '../controllers/marginController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/recommend/:superRecipeId', recommendMargin);

export default router;
