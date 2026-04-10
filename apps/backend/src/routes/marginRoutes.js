import express from 'express';
import { recommendMargin } from '../controllers/marginController.js';

const router = express.Router();

router.get('/recommend/:superRecipeId', recommendMargin);

export default router;
